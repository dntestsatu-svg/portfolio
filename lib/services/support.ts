import crypto from "node:crypto";
import { Prisma, type SupportTransaction, type SupportTransactionStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { appEnv, hasDatabaseConfig, hasGoqrConfig } from "@/lib/env";
import { generateSupportQr, GoqrError } from "@/lib/goqr";
import { qrisPayloadToDataUrl } from "@/lib/qris";
import { slugify } from "@/lib/slug";
import {
  SUPPORT_EXPIRE_SECONDS,
  SUPPORT_LEADERBOARD_PAGE_SIZE,
  SUPPORT_LEADERBOARD_PREVIEW_LIMIT,
  type SupportLeaderboardEntry,
  type SupportLeaderboardPage,
  type SupportLeaderboardSummary,
  type SupportTransactionSnapshot,
} from "@/lib/support-shared";
import type { GoqrWebhookInput, SupportGenerateInput } from "@/lib/validators";

const FINAL_SUPPORT_STATUSES: SupportTransactionStatus[] = ["success", "failed", "expired"];

type ApplyWebhookResult = {
  transaction: SupportTransactionSnapshot;
  action: "integration_check" | "updated" | "ignored";
};

type LeaderboardAggregateRow = {
  supporterIdentityHash: string;
  totalAmount: unknown;
  supportCount: unknown;
  lastSupportAt: Date | string;
};

type LeaderboardCountRow = {
  totalEntries: unknown;
};

type LeaderboardSummaryRow = {
  totalAmount: unknown;
  totalSupporters: unknown;
  latestSupportAt: Date | string | null;
};

type LeaderboardDisplayRow = {
  supporterIdentityHash: string | null;
  supporterName: string | null;
  isAnonymous: number | boolean;
  message: string | null;
  lastSupportAt: Date | string;
};

type SupportLeaderboardEntryBase = Omit<SupportLeaderboardEntry, "rank">;

function formatSupportAmount(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSupportDate(value: Date | string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
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

function normalizeSupporterName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function hashSupporterIdentity(value: string) {
  const normalized = normalizeSupporterName(value).toLocaleLowerCase("id-ID");

  if (!normalized) {
    return null;
  }

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function getPublicSupporterDisplayName(options: {
  supporterName?: string | null;
  isAnonymous?: boolean;
}) {
  if (options.isAnonymous) {
    return "Anonim";
  }

  const name = normalizeSupporterName(options.supporterName ?? "");
  return name || "Supporter";
}

export function compareSupportLeaderboardEntries(
  left: Pick<SupportLeaderboardEntry, "totalAmount" | "supportCount" | "lastSupportAtISO">,
  right: Pick<SupportLeaderboardEntry, "totalAmount" | "supportCount" | "lastSupportAtISO">,
) {
  if (right.totalAmount !== left.totalAmount) {
    return right.totalAmount - left.totalAmount;
  }

  if (right.supportCount !== left.supportCount) {
    return right.supportCount - left.supportCount;
  }

  return new Date(right.lastSupportAtISO).getTime() - new Date(left.lastSupportAtISO).getTime();
}

function parseDateValue(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function toSafeNumber(value: unknown) {
  if (value == null) {
    return 0;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const fallback = Number(String(value));
  return Number.isFinite(fallback) ? fallback : 0;
}

function mapSupportTransaction(record: SupportTransaction): SupportTransactionSnapshot {
  const statusMeta = getSupportStatusMeta(record.status);

  return {
    customRef: record.customRef,
    trxId: record.trxId,
    username: record.username,
    amount: record.amount,
    amountLabel: formatSupportAmount(record.amount),
    donor: {
      displayName: getPublicSupporterDisplayName(record),
      isAnonymous: record.isAnonymous,
      showOnLeaderboard: record.showOnLeaderboard,
      message: record.message?.trim() || undefined,
    },
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

function buildEmptyLeaderboard(page = 1, pageSize = SUPPORT_LEADERBOARD_PAGE_SIZE): SupportLeaderboardPage {
  const summary: SupportLeaderboardSummary = {
    totalSupporters: 0,
    totalSupportersLabel: "0 supporter",
    totalAmount: 0,
    totalAmountLabel: formatSupportAmount(0),
  };

  return {
    entries: [],
    summary,
    page,
    pageSize,
    totalEntries: 0,
    totalPages: 1,
  };
}

function getLeaderboardBaseWhere() {
  return Prisma.sql`
    status = 'success'
    AND show_on_leaderboard = 1
    AND supporter_identity_hash IS NOT NULL
  `;
}

function mapLeaderboardEntry(
  row: LeaderboardAggregateRow,
  displayRow?: LeaderboardDisplayRow,
): SupportLeaderboardEntryBase {
  const totalAmount = toSafeNumber(row.totalAmount);
  const supportCount = toSafeNumber(row.supportCount);
  const lastSupportAt = parseDateValue(row.lastSupportAt) ?? new Date();

  return {
    displayName: getPublicSupporterDisplayName({
      supporterName: displayRow?.supporterName,
      isAnonymous: Boolean(displayRow?.isAnonymous),
    }),
    isAnonymous: Boolean(displayRow?.isAnonymous),
    totalAmount,
    totalAmountLabel: formatSupportAmount(totalAmount),
    supportCount,
    lastSupportAtISO: lastSupportAt.toISOString(),
    lastSupportLabel: formatSupportDate(lastSupportAt) ?? "Baru saja",
    latestMessage: displayRow?.message?.trim() || undefined,
  };
}

async function getLeaderboardDisplayRows(identities: string[]) {
  const db = getDb();

  if (!db || identities.length === 0) {
    return new Map<string, LeaderboardDisplayRow>();
  }

  const rows = await db.$queryRaw<LeaderboardDisplayRow[]>(Prisma.sql`
    SELECT
      supporter_identity_hash AS supporterIdentityHash,
      supporter_name AS supporterName,
      is_anonymous AS isAnonymous,
      message,
      COALESCE(finished_at, updated_at, created_at) AS lastSupportAt
    FROM support_transactions
    WHERE ${getLeaderboardBaseWhere()}
      AND supporter_identity_hash IN (${Prisma.join(identities)})
    ORDER BY COALESCE(finished_at, updated_at, created_at) DESC
  `);

  const map = new Map<string, LeaderboardDisplayRow>();

  for (const row of rows) {
    if (row.supporterIdentityHash && !map.has(row.supporterIdentityHash)) {
      map.set(row.supporterIdentityHash, row);
    }
  }

  return map;
}

async function fetchSupportLeaderboard(page: number, pageSize: number): Promise<SupportLeaderboardPage> {
  const db = getDb();
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const safePage = Math.max(1, page);

  if (!hasDatabaseConfig || !db) {
    return buildEmptyLeaderboard(safePage, safePageSize);
  }

  const baseWhere = getLeaderboardBaseWhere();
  const offset = (safePage - 1) * safePageSize;
  const [countRows, summaryRows, aggregateRows] = await Promise.all([
    db.$queryRaw<LeaderboardCountRow[]>(Prisma.sql`
      SELECT COUNT(DISTINCT supporter_identity_hash) AS totalEntries
      FROM support_transactions
      WHERE ${baseWhere}
    `),
    db.$queryRaw<LeaderboardSummaryRow[]>(Prisma.sql`
      SELECT
        COALESCE(SUM(amount), 0) AS totalAmount,
        COUNT(DISTINCT supporter_identity_hash) AS totalSupporters,
        MAX(COALESCE(finished_at, updated_at, created_at)) AS latestSupportAt
      FROM support_transactions
      WHERE ${baseWhere}
    `),
    db.$queryRaw<LeaderboardAggregateRow[]>(Prisma.sql`
      SELECT
        supporter_identity_hash AS supporterIdentityHash,
        SUM(amount) AS totalAmount,
        COUNT(*) AS supportCount,
        MAX(COALESCE(finished_at, updated_at, created_at)) AS lastSupportAt
      FROM support_transactions
      WHERE ${baseWhere}
      GROUP BY supporter_identity_hash
      ORDER BY totalAmount DESC, supportCount DESC, lastSupportAt DESC
      LIMIT ${safePageSize} OFFSET ${offset}
    `),
  ]);

  const totalEntries = toSafeNumber(countRows[0]?.totalEntries);
  if (totalEntries === 0) {
    return buildEmptyLeaderboard(safePage, safePageSize);
  }

  const summaryRow = summaryRows[0];
  const totalPages = Math.max(1, Math.ceil(totalEntries / safePageSize));
  if (safePage > totalPages) {
    return fetchSupportLeaderboard(totalPages, safePageSize);
  }
  const displayMap = await getLeaderboardDisplayRows(
    aggregateRows.map((row) => row.supporterIdentityHash),
  );

  const entries = aggregateRows
    .map((row) => mapLeaderboardEntry(row, displayMap.get(row.supporterIdentityHash)))
    .sort(compareSupportLeaderboardEntries)
    .map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }));

  return {
    entries,
    summary: {
      totalSupporters: toSafeNumber(summaryRow?.totalSupporters),
      totalSupportersLabel: `${new Intl.NumberFormat("id-ID").format(toSafeNumber(summaryRow?.totalSupporters))} supporter`,
      totalAmount: toSafeNumber(summaryRow?.totalAmount),
      totalAmountLabel: formatSupportAmount(toSafeNumber(summaryRow?.totalAmount)),
      latestSupportAtISO: parseDateValue(summaryRow?.latestSupportAt)?.toISOString(),
      latestSupportLabel: formatSupportDate(summaryRow?.latestSupportAt),
    },
    page: Math.min(safePage, totalPages),
    pageSize: safePageSize,
    totalEntries,
    totalPages,
  };
}

export async function generateSupportTransaction(input: SupportGenerateInput) {
  const db = getDb();

  if (!hasDatabaseConfig || !db) {
    throw new GoqrError("DATABASE_URL belum dikonfigurasi.", 503);
  }

  if (!hasGoqrConfig) {
    throw new GoqrError("Konfigurasi GOQR belum lengkap.", 503);
  }

  const customRef = buildSupportCustomRef();
  const username = buildSupportUsername();
  const supporterName = normalizeSupporterName(input.supporterName);
  const supporterIdentityHash = hashSupporterIdentity(supporterName);

  if (!supporterIdentityHash) {
    throw new GoqrError("Nama supporter belum valid.", 400);
  }

  const generated = await generateSupportQr({
    amount: input.amount,
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
      supporterName,
      supporterIdentityHash,
      isAnonymous: input.isAnonymous,
      message: input.message.trim() || undefined,
      showOnLeaderboard: input.showOnLeaderboard,
      amount: input.amount,
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

export async function getSupportLeaderboardPreview(limit = SUPPORT_LEADERBOARD_PREVIEW_LIMIT) {
  return fetchSupportLeaderboard(1, limit);
}

export async function getSupportLeaderboardPage(page: number, pageSize = SUPPORT_LEADERBOARD_PAGE_SIZE) {
  return fetchSupportLeaderboard(page, pageSize);
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
