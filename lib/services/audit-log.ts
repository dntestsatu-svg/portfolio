import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import type { AdminSession } from "@/lib/auth/session";
import { appEnv } from "@/lib/env";
import { getClientIp } from "@/lib/security/rate-limit";

const DEFAULT_AUDIT_RETENTION_DAYS = 90;
const DEFAULT_FAILED_LOGIN_ALERT_THRESHOLD = 10;
const DEFAULT_FAILED_LOGIN_ALERT_WINDOW_MINUTES = 15;
const DEFAULT_AUDIT_EXPORT_MAX_ROWS = 500;
const DEFAULT_AUDIT_EXPORT_MAX_DAYS = 31;
const DEFAULT_AUDIT_EXPORT_DAYS = 30;
const DEFAULT_AUDIT_EXPORT_ROWS = 250;

export const auditActionOptions = [
  "login",
  "failed_login",
  "alert",
  "logout",
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
] as const;

export const auditEntityTypeOptions = ["auth", "project", "blog"] as const;

export type AdminAuditAction = (typeof auditActionOptions)[number];
export type AdminAuditEntityType = (typeof auditEntityTypeOptions)[number];

type AuditMetadataSummary = {
  label: string;
  value: string;
};

export type AdminAuditListItem = {
  id: string;
  action: string;
  entityType: string;
  actorEmail: string;
  entityLabel: string | null;
  ipAddress: string | null;
  createdAt: Date;
  metadataSummary: AuditMetadataSummary[];
};

type AuditLogInput = {
  action: AdminAuditAction;
  entityType: AdminAuditEntityType;
  request: NextRequest;
  session?: AdminSession | null;
  actorEmail?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Prisma.InputJsonObject;
};

type ContentAuditLogInput = {
  action: "create" | "update" | "delete";
  entityType: Exclude<AdminAuditEntityType, "auth">;
  request: NextRequest;
  session: AdminSession;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Prisma.InputJsonObject;
  previousPublished?: boolean | null;
  nextPublished?: boolean | null;
};

type FailedLoginAuditInput = {
  request: NextRequest;
  identifier?: string | null;
  failureCategory: string;
  transport: "form" | "json";
  metadata?: Prisma.InputJsonObject;
};

type AuditExportOptions = {
  action?: string | null;
  entityType?: string | null;
  days?: number | string | null;
  limit?: number | string | null;
};

const auditLogListSelect = {
  id: true,
  action: true,
  entityType: true,
  actorEmail: true,
  entityLabel: true,
  ipAddress: true,
  createdAt: true,
  metadata: true,
} satisfies Prisma.AuditLogSelect;

type AuditLogListRecord = Prisma.AuditLogGetPayload<{
  select: typeof auditLogListSelect;
}>;

function readPositiveInt(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
}

function clampPositiveInt(
  value: unknown,
  options: { fallback: number; min?: number; max?: number },
) {
  const parsed = readPositiveInt(value, options.fallback);
  const min = options.min ?? 1;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;

  return Math.min(Math.max(parsed, min), max);
}

export function getAuditLifecyclePolicy() {
  const retentionDays = readPositiveInt(
    appEnv.auditLogRetentionDays,
    DEFAULT_AUDIT_RETENTION_DAYS,
  );
  const failedLoginAlertThreshold = readPositiveInt(
    appEnv.auditFailedLoginAlertThreshold,
    DEFAULT_FAILED_LOGIN_ALERT_THRESHOLD,
  );
  const failedLoginAlertWindowMinutes = readPositiveInt(
    appEnv.auditFailedLoginAlertWindowMinutes,
    DEFAULT_FAILED_LOGIN_ALERT_WINDOW_MINUTES,
  );
  const exportMaxRows = readPositiveInt(
    appEnv.auditExportMaxRows,
    DEFAULT_AUDIT_EXPORT_MAX_ROWS,
  );
  const exportMaxDays = readPositiveInt(
    appEnv.auditExportMaxDays,
    DEFAULT_AUDIT_EXPORT_MAX_DAYS,
  );

  return {
    retentionDays,
    failedLoginAlertThreshold,
    failedLoginAlertWindowMinutes,
    exportMaxRows,
    exportMaxDays,
    exportDefaultRows: Math.min(DEFAULT_AUDIT_EXPORT_ROWS, exportMaxRows),
    exportDefaultDays: Math.min(DEFAULT_AUDIT_EXPORT_DAYS, exportMaxDays),
  };
}

export function getAuditRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - getAuditLifecyclePolicy().retentionDays);
  return cutoff;
}

function getAuditExportDays(value?: number | string | null) {
  const policy = getAuditLifecyclePolicy();
  return clampPositiveInt(value, {
    fallback: policy.exportDefaultDays,
    max: policy.exportMaxDays,
  });
}

function getAuditExportLimit(value?: number | string | null) {
  const policy = getAuditLifecyclePolicy();
  return clampPositiveInt(value, {
    fallback: policy.exportDefaultRows,
    max: policy.exportMaxRows,
  });
}

export function normalizeAuditIdentifier(value?: string | null) {
  return value?.trim().toLowerCase().slice(0, 190) || "unknown";
}

function normalizeAuditActorEmail(value?: string | null) {
  return normalizeAuditIdentifier(value);
}

function maskToken(value: string, keep: number) {
  if (!value) {
    return "***";
  }

  return `${value.slice(0, Math.max(1, keep))}***`;
}

export function maskAuditIdentifier(value?: string | null) {
  const normalized = normalizeAuditIdentifier(value);

  if (normalized === "unknown") {
    return normalized;
  }

  const [local, domain] = normalized.split("@");

  if (!domain) {
    return maskToken(normalized, 2);
  }

  const dotIndex = domain.lastIndexOf(".");
  const domainName = dotIndex >= 0 ? domain.slice(0, dotIndex) : domain;
  const domainSuffix = dotIndex >= 0 ? domain.slice(dotIndex) : "";

  return `${maskToken(local, 2)}@${maskToken(domainName, 1)}${domainSuffix}`;
}

export function hashAuditValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("base64url");
}

export function hashAuditIdentifier(value?: string | null) {
  const normalized = normalizeAuditIdentifier(value);
  return normalized === "unknown" ? null : hashAuditValue(normalized);
}

function toMetadataObject(
  metadata?: Prisma.JsonValue | Prisma.InputJsonObject | null,
): Record<string, unknown> {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== "object") {
    return {};
  }

  return metadata as Record<string, unknown>;
}

function pushMetadataSummary(summary: AuditMetadataSummary[], label: string, value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    summary.push({ label, value: value.trim() });
    return;
  }

  if (typeof value === "boolean") {
    summary.push({ label, value: value ? "Ya" : "Tidak" });
    return;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    summary.push({ label, value: String(value) });
  }
}

function formatFailureCategory(value: string) {
  const labels: Record<string, string> = {
    invalid_credentials: "Kredensial tidak valid",
    invalid_payload: "Payload login tidak valid",
    request_rejected: "Request ditolak",
    rate_limited_ip: "Rate limit per IP",
    rate_limited_identifier: "Rate limit per identifier",
    rate_limited_pair: "Rate limit per pasangan IP + identifier",
    internal_error: "Kesalahan internal",
  };

  return labels[value] ?? value;
}

function formatAlertType(value: string) {
  const labels: Record<string, string> = {
    failed_login_identifier_burst: "Burst identifier login gagal",
    failed_login_ip_burst: "Burst IP login gagal",
  };

  return labels[value] ?? value;
}

export function getAuditMetadataSummary(
  metadata?: Prisma.JsonValue | Prisma.InputJsonObject | null,
) {
  const object = toMetadataObject(metadata);
  const summary: AuditMetadataSummary[] = [];

  if (typeof object.failureCategory === "string") {
    pushMetadataSummary(summary, "Kategori", formatFailureCategory(object.failureCategory));
  }

  if (typeof object.alertType === "string") {
    pushMetadataSummary(summary, "Alert", formatAlertType(object.alertType));
  }

  pushMetadataSummary(summary, "Transport", object.transport);
  pushMetadataSummary(summary, "Slug", object.slug);
  pushMetadataSummary(summary, "Slug sebelumnya", object.previousSlug);
  pushMetadataSummary(summary, "Featured", object.featured);
  pushMetadataSummary(summary, "Published", object.published);
  pushMetadataSummary(summary, "Sebelumnya published", object.previousPublished);
  pushMetadataSummary(summary, "Setelah update published", object.nextPublished);
  pushMetadataSummary(summary, "Ambang", object.threshold);
  pushMetadataSummary(summary, "Window menit", object.windowMinutes);
  pushMetadataSummary(summary, "Jumlah event", object.eventCount);

  return summary;
}

export function getAdminAuditActionLabel(action: string) {
  const labels: Record<string, string> = {
    login: "Login",
    failed_login: "Login gagal",
    alert: "Alert",
    logout: "Logout",
    create: "Create",
    update: "Update",
    delete: "Delete",
    publish: "Publish",
    unpublish: "Unpublish",
  };

  return labels[action] ?? action;
}

export function getAdminAuditEntityLabel(entityType: string) {
  const labels: Record<string, string> = {
    auth: "Auth",
    project: "Project",
    blog: "Blog",
  };

  return labels[entityType] ?? entityType;
}

export function isAuditAction(value?: string | null): value is AdminAuditAction {
  return Boolean(value && auditActionOptions.includes(value as AdminAuditAction));
}

export function isAuditEntityType(value?: string | null): value is AdminAuditEntityType {
  return Boolean(value && auditEntityTypeOptions.includes(value as AdminAuditEntityType));
}

function mapAuditLogRecord(record: AuditLogListRecord): AdminAuditListItem {
  return {
    id: record.id,
    action: record.action,
    entityType: record.entityType,
    actorEmail: normalizeAuditActorEmail(record.actorEmail),
    entityLabel: record.entityLabel,
    ipAddress: record.ipAddress,
    createdAt: record.createdAt,
    metadataSummary: getAuditMetadataSummary(record.metadata),
  };
}

export async function recordAdminAuditLog(input: AuditLogInput) {
  const db = getDb();

  if (!db) {
    return null;
  }

  return db.auditLog.create({
    data: {
      actorId: input.session?.userId ?? null,
      actorEmail: normalizeAuditActorEmail(input.session?.email ?? input.actorEmail),
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel ?? null,
      ipAddress: getClientIp(input.request),
      userAgent: input.request.headers.get("user-agent"),
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function recordAdminAuditLogSafely(input: AuditLogInput) {
  try {
    await recordAdminAuditLog(input);
  } catch (error) {
    console.error("Gagal mencatat audit log admin:", error);
  }
}

function shouldLogPublishState(input: ContentAuditLogInput) {
  if (input.action === "create") {
    return input.nextPublished === true ? "publish" : null;
  }

  if (input.action !== "update") {
    return null;
  }

  if (input.previousPublished === input.nextPublished) {
    return null;
  }

  return input.nextPublished ? "publish" : "unpublish";
}

export async function recordAdminContentAuditLogSafely(input: ContentAuditLogInput) {
  await recordAdminAuditLogSafely({
    action: input.action,
    entityType: input.entityType,
    request: input.request,
    session: input.session,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    metadata: input.metadata,
  });

  const publishAction = shouldLogPublishState(input);

  if (!publishAction) {
    return;
  }

  await recordAdminAuditLogSafely({
    action: publishAction,
    entityType: input.entityType,
    request: input.request,
    session: input.session,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    metadata: {
      ...input.metadata,
      previousPublished: input.previousPublished ?? null,
      nextPublished: input.nextPublished ?? null,
    },
  });
}

async function recordFailedLoginAlertIfNeeded(input: FailedLoginAuditInput) {
  const db = getDb();

  if (!db) {
    return;
  }

  const policy = getAuditLifecyclePolicy();
  const windowStart = new Date(Date.now() - policy.failedLoginAlertWindowMinutes * 60 * 1000);
  const ip = getClientIp(input.request);
  const normalizedIdentifier = normalizeAuditIdentifier(input.identifier);
  const identifierHash = hashAuditIdentifier(normalizedIdentifier);

  const scope = identifierHash
    ? {
        alertType: "failed_login_identifier_burst",
        actorEmail: maskAuditIdentifier(normalizedIdentifier),
        alertEntityId: `failed-login-alert:identifier:${identifierHash}`,
        where: {
          action: "failed_login",
          entityType: "auth",
          entityId: identifierHash,
          createdAt: { gte: windowStart },
        } satisfies Prisma.AuditLogWhereInput,
      }
    : {
        alertType: "failed_login_ip_burst",
        actorEmail: "unknown",
        alertEntityId: `failed-login-alert:ip:${hashAuditValue(ip)}`,
        where: {
          action: "failed_login",
          entityType: "auth",
          ipAddress: ip,
          createdAt: { gte: windowStart },
        } satisfies Prisma.AuditLogWhereInput,
      };

  const eventCount = await db.auditLog.count({
    where: scope.where,
  });

  if (eventCount < policy.failedLoginAlertThreshold) {
    return;
  }

  const existingAlert = await db.auditLog.findFirst({
    where: {
      action: "alert",
      entityType: "auth",
      entityId: scope.alertEntityId,
      createdAt: { gte: windowStart },
    },
    select: {
      id: true,
    },
  });

  if (existingAlert) {
    return;
  }

  await db.auditLog.create({
    data: {
      actorId: null,
      actorEmail: scope.actorEmail,
      action: "alert",
      entityType: "auth",
      entityId: scope.alertEntityId,
      entityLabel: "failed-login-threshold",
      ipAddress: ip,
      userAgent: input.request.headers.get("user-agent"),
      metadata: {
        alertType: scope.alertType,
        threshold: policy.failedLoginAlertThreshold,
        windowMinutes: policy.failedLoginAlertWindowMinutes,
        eventCount,
        failureCategory: input.failureCategory,
        transport: input.transport,
      },
    },
  });
}

export async function recordFailedLoginAuditLogSafely(input: FailedLoginAuditInput) {
  const normalizedIdentifier = normalizeAuditIdentifier(input.identifier);
  const maskedIdentifier = maskAuditIdentifier(normalizedIdentifier);
  const identifierHash = hashAuditIdentifier(normalizedIdentifier);

  await recordAdminAuditLogSafely({
    action: "failed_login",
    entityType: "auth",
    request: input.request,
    actorEmail: maskedIdentifier,
    entityId: identifierHash,
    entityLabel: "admin-login",
    metadata: {
      failureCategory: input.failureCategory,
      transport: input.transport,
      ...input.metadata,
    },
  });

  try {
    await recordFailedLoginAlertIfNeeded(input);
  } catch (error) {
    console.error("Gagal mengevaluasi alert failed login:", error);
  }
}

export async function getAdminAuditLogPage(options: {
  page?: number;
  action?: string | null;
  entityType?: string | null;
}) {
  const db = getDb();
  const page = Math.max(1, options.page ?? 1);
  const action = isAuditAction(options.action) ? options.action : undefined;
  const entityType = isAuditEntityType(options.entityType) ? options.entityType : undefined;
  const where: Prisma.AuditLogWhereInput = {
    action,
    entityType,
  };

  if (!db) {
    return {
      items: [] as AdminAuditListItem[],
      totalCount: 0,
      totalPages: 1,
      page,
      pageSize: 20,
      filters: {
        action: action ?? "",
        entityType: entityType ?? "",
      },
    };
  }

  const [totalCount, records] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * 20,
      take: 20,
      select: auditLogListSelect,
    }),
  ]);

  return {
    items: records.map(mapAuditLogRecord),
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / 20)),
    page,
    pageSize: 20,
    filters: {
      action: action ?? "",
      entityType: entityType ?? "",
    },
  };
}

export async function getAdminAuditExportData(options: AuditExportOptions = {}) {
  const db = getDb();
  const action = isAuditAction(options.action) ? options.action : undefined;
  const entityType = isAuditEntityType(options.entityType) ? options.entityType : undefined;
  const days = getAuditExportDays(options.days);
  const limit = getAuditExportLimit(options.limit);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where: Prisma.AuditLogWhereInput = {
    action,
    entityType,
    createdAt: { gte: since },
  };

  if (!db) {
    return {
      items: [] as AdminAuditListItem[],
      days,
      limit,
      since,
      filters: {
        action: action ?? "",
        entityType: entityType ?? "",
      },
    };
  }

  const records = await db.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    select: auditLogListSelect,
  });

  return {
    items: records.map(mapAuditLogRecord),
    days,
    limit,
    since,
    filters: {
      action: action ?? "",
      entityType: entityType ?? "",
    },
  };
}

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, " ");

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function buildAdminAuditExportCsv(items: AdminAuditListItem[]) {
  const header = [
    "timestamp_iso",
    "action",
    "entity_type",
    "actor_identifier",
    "ip_address",
    "entity_label",
    "metadata_summary",
  ];

  const rows = items.map((item) => {
    const metadataSummary = item.metadataSummary
      .map((entry) => `${entry.label}: ${entry.value}`)
      .join(" | ");

    return [
      item.createdAt.toISOString(),
      item.action,
      item.entityType,
      item.actorEmail,
      item.ipAddress ?? "",
      item.entityLabel ?? "",
      metadataSummary,
    ].map((cell) => escapeCsvCell(cell)).join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

export async function pruneExpiredAuditLogs(options?: {
  dryRun?: boolean;
  now?: Date;
}) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const policy = getAuditLifecyclePolicy();
  const cutoff = getAuditRetentionCutoff(options?.now);
  const expiredCount = await db.auditLog.count({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  if (options?.dryRun || expiredCount === 0) {
    return {
      retentionDays: policy.retentionDays,
      cutoff,
      expiredCount,
      deletedCount: 0,
      dryRun: Boolean(options?.dryRun),
    };
  }

  const result = await db.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  return {
    retentionDays: policy.retentionDays,
    cutoff,
    expiredCount,
    deletedCount: result.count,
    dryRun: false,
  };
}
