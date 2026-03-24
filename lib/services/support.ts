import crypto from "node:crypto";
import type { SupportTransaction, SupportTransactionStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { appEnv, hasDatabaseConfig, hasGoqrConfig } from "@/lib/env";
import { generateSupportQr, GoqrError } from "@/lib/goqr";
import { qrisPayloadToDataUrl } from "@/lib/qris";
import { slugify } from "@/lib/slug";
import {
  SUPPORT_EXPIRE_SECONDS,
  type SupportTransactionSnapshot,
} from "@/lib/support-shared";
import type { GoqrWebhookInput } from "@/lib/validators";

const FINAL_SUPPORT_STATUSES: SupportTransactionStatus[] = ["success", "failed", "expired"];
export type SupportTransactionView = SupportTransactionSnapshot;

type ApplyWebhookResult = {
  transaction: SupportTransactionView;
  action: "integration_check" | "updated" | "ignored";
};

function formatSupportAmount(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSupportStatusMeta(status: SupportTransactionStatus) {
  switch (status) {
    case "success":
      return { label: "Pembayaran berhasil", tone: "success" as const };
    case "failed":
      return { label: "Pembayaran gagal", tone: "danger" as const };
    case "expired":
      return { label: "QRIS kedaluwarsa", tone: "muted" as const };
    case "pending":
    default:
      return { label: "Menunggu pembayaran", tone: "accent" as const };
  }
}

function isFinalSupportStatus(status: SupportTransactionStatus) {
  return FINAL_SUPPORT_STATUSES.includes(status);
}

function parseWebhookDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function buildSupportUsername() {
  const base = slugify(appEnv.goqrTokoName ?? "support").slice(0, 18) || "support";
  return `${base}-${crypto.randomBytes(4).toString("hex")}`;
}

function buildSupportCustomRef() {
  return `SUP${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function mapSupportTransaction(record: SupportTransaction): SupportTransactionView {
  const statusMeta = getSupportStatusMeta(record.status);

  return {
    customRef: record.customRef,
    trxId: record.trxId,
    username: record.username,
    amount: record.amount,
    amountLabel: formatSupportAmount(record.amount),
    status: record.status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    vendor: record.vendor ?? undefined,
    rrn: record.rrn ?? undefined,
    merchantId: record.merchantId ?? undefined,
    createdAtISO: record.createdAt.toISOString(),
    updatedAtISO: record.updatedAt.toISOString(),
    finishedAtISO: record.finishedAt?.toISOString(),
    expiresAtISO: record.expiresAt.toISOString(),
    isExpired: record.status === "expired" || record.expiresAt.getTime() <= Date.now(),
  };
}

async function markExpiredIfNeeded(record: SupportTransaction | null) {
  const db = getDb();

  if (!db || !record || record.status !== "pending" || record.expiresAt.getTime() > Date.now()) {
    return record;
  }

  await db.supportTransaction.updateMany({
    where: {
      id: record.id,
      status: "pending",
    },
    data: {
      status: "expired",
      finishedAt: new Date(),
    },
  });

  return db.supportTransaction.findUnique({
    where: { id: record.id },
  });
}

export async function generateSupportTransaction(amount: number) {
  const db = getDb();

  if (!hasDatabaseConfig || !db) {
    throw new GoqrError("DATABASE_URL belum dikonfigurasi.", 503);
  }

  if (!hasGoqrConfig) {
    throw new GoqrError("Konfigurasi GOQR belum lengkap.", 503);
  }

  const customRef = buildSupportCustomRef();
  const username = buildSupportUsername();
  const generated = await generateSupportQr({
    amount,
    expireSeconds: SUPPORT_EXPIRE_SECONDS,
    customRef,
    username,
  });
  const expiresAt =
    generated.expiredAt ?? new Date(Date.now() + SUPPORT_EXPIRE_SECONDS * 1000);

  const record = await db.supportTransaction.create({
    data: {
      customRef,
      trxId: generated.trxId,
      username,
      amount,
      qrisPayload: generated.qrisPayload,
      status: "pending",
      merchantId: appEnv.goqrToken,
      rawGenerate: generated.rawGenerate ?? undefined,
      expiresAt,
    },
  });

  return {
    transaction: mapSupportTransaction(record),
    qrisImageDataUrl: await qrisPayloadToDataUrl(generated.qrisPayload),
  };
}

export async function getSupportTransactionByCustomRef(customRef: string) {
  const db = getDb();

  if (!hasDatabaseConfig || !db) {
    throw new GoqrError("DATABASE_URL belum dikonfigurasi.", 503);
  }

  const record = await markExpiredIfNeeded(
    await db.supportTransaction.findUnique({
      where: { customRef },
    }),
  );

  return record ? mapSupportTransaction(record) : null;
}

function normalizeSupportStatus(status: string): SupportTransactionStatus {
  if (status === "success" || status === "failed" || status === "expired") {
    return status;
  }

  return "pending";
}

export async function applyGoqrWebhook(payload: GoqrWebhookInput): Promise<ApplyWebhookResult> {
  const db = getDb();

  if (!hasDatabaseConfig || !db) {
    throw new GoqrError("DATABASE_URL belum dikonfigurasi.", 503);
  }

  if ((appEnv.goqrToken ?? "").trim() !== payload.merchant_id.trim()) {
    throw new GoqrError("merchant_id tidak cocok.", 401);
  }

  const byCustomRef = payload.custom_ref
    ? await db.supportTransaction.findUnique({
        where: { customRef: payload.custom_ref },
      })
    : null;
  const record =
    byCustomRef ??
    (await db.supportTransaction.findUnique({
      where: { trxId: payload.trx_id },
    }));

  if (!record) {
    throw new GoqrError("Transaksi dukungan tidak ditemukan.", 404);
  }

  if (record.username !== payload.terminal_id.trim()) {
    throw new GoqrError("terminal_id tidak cocok dengan transaksi lokal.", 400);
  }

  if (payload.custom_ref && record.customRef !== payload.custom_ref) {
    throw new GoqrError("custom_ref tidak cocok dengan transaksi lokal.", 400);
  }

  const nextStatus = normalizeSupportStatus(payload.status);
  const webhookData = {
    amount: payload.amount,
    terminal_id: payload.terminal_id,
    merchant_id: payload.merchant_id,
    trx_id: payload.trx_id,
    rrn: payload.rrn,
    custom_ref: payload.custom_ref,
    vendor: payload.vendor,
    status: payload.status,
    created_at: payload.created_at,
    finish_at: payload.finish_at,
  };

  if (isFinalSupportStatus(record.status)) {
    return {
      transaction: mapSupportTransaction(record),
      action: "ignored",
    };
  }

  const updated = await db.supportTransaction.update({
    where: { id: record.id },
    data: {
      status: nextStatus,
      vendor: payload.vendor || record.vendor,
      rrn: payload.rrn || record.rrn,
      merchantId: payload.merchant_id,
      rawWebhook: webhookData,
      finishedAt: nextStatus === "pending" ? null : parseWebhookDate(payload.finish_at) ?? new Date(),
    },
  });

  return {
    transaction: mapSupportTransaction(updated),
    action: "updated",
  };
}

export function isGoqrIntegrationCheckPayload(payload: unknown) {
  return Boolean(payload && typeof payload === "object" && Object.keys(payload).length === 0);
}
