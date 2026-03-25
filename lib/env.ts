import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
  AUDIT_FAILED_LOGIN_ALERT_THRESHOLD: z.coerce.number().int().positive().optional(),
  AUDIT_FAILED_LOGIN_ALERT_WINDOW_MINUTES: z.coerce.number().int().positive().optional(),
  AUDIT_EXPORT_MAX_ROWS: z.coerce.number().int().positive().optional(),
  AUDIT_EXPORT_MAX_DAYS: z.coerce.number().int().positive().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_GITHUB_URL: z.string().url().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  API_GOQR_ENDPOINT: z.string().url().optional(),
  API_GOQR_TOKONAME: z.string().min(2).optional(),
  API_GOQR_TOKEN: z.string().min(1).optional(),
  API_GOQR_WEBHOOK_SECRET: z.union([z.literal(""), z.string().min(1)]).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);
const globalForEnvWarnings = globalThis as typeof globalThis & {
  hasLoggedProductionReadinessWarnings?: boolean;
};

if (!parsedEnv.success) {
  console.warn("Beberapa environment variable tidak valid:", parsedEnv.error.flatten().fieldErrors);
}

const env = parsedEnv.success ? parsedEnv.data : process.env;

function normalizeOptionalString(value: string | undefined | null) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function isPlaceholderSecret(value: string | undefined) {
  const normalized = normalizeOptionalString(value)?.toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    normalized.includes("ganti-dengan") ||
    normalized.includes("change-me") ||
    normalized.includes("replace-me") ||
    normalized.startsWith("<") ||
    normalized.endsWith(">")
  );
}

function isPlaceholderUrl(value: string | undefined) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return true;
  }

  try {
    const url = new URL(normalized);
    return ["example.com", "www.example.com"].includes(url.hostname);
  } catch {
    return true;
  }
}

export const appEnv = {
  databaseUrl: normalizeOptionalString(env.DATABASE_URL),
  authSecret: normalizeOptionalString(env.AUTH_SECRET),
  adminEmail: normalizeOptionalString(env.ADMIN_EMAIL),
  adminPassword: normalizeOptionalString(env.ADMIN_PASSWORD),
  upstashRedisRestUrl: normalizeOptionalString(env.UPSTASH_REDIS_REST_URL),
  upstashRedisRestToken: normalizeOptionalString(env.UPSTASH_REDIS_REST_TOKEN),
  auditLogRetentionDays: env.AUDIT_LOG_RETENTION_DAYS,
  auditFailedLoginAlertThreshold: env.AUDIT_FAILED_LOGIN_ALERT_THRESHOLD,
  auditFailedLoginAlertWindowMinutes: env.AUDIT_FAILED_LOGIN_ALERT_WINDOW_MINUTES,
  auditExportMaxRows: env.AUDIT_EXPORT_MAX_ROWS,
  auditExportMaxDays: env.AUDIT_EXPORT_MAX_DAYS,
  siteUrl: normalizeOptionalString(env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  contactEmail: normalizeOptionalString(env.NEXT_PUBLIC_CONTACT_EMAIL),
  githubUrl: normalizeOptionalString(env.NEXT_PUBLIC_GITHUB_URL),
  linkedinUrl: normalizeOptionalString(env.NEXT_PUBLIC_LINKEDIN_URL),
  goqrEndpoint: normalizeOptionalString(env.API_GOQR_ENDPOINT),
  goqrTokoName: normalizeOptionalString(env.API_GOQR_TOKONAME),
  goqrToken: normalizeOptionalString(env.API_GOQR_TOKEN),
  goqrWebhookSecret: normalizeOptionalString(env.API_GOQR_WEBHOOK_SECRET),
};

export const hasDatabaseConfig = Boolean(appEnv.databaseUrl);
export const hasAuthSecret = Boolean(appEnv.authSecret && !isPlaceholderSecret(appEnv.authSecret));
export const hasUpstashRedisConfig = Boolean(
  appEnv.upstashRedisRestUrl &&
    !isPlaceholderUrl(appEnv.upstashRedisRestUrl) &&
    appEnv.upstashRedisRestToken &&
    !isPlaceholderSecret(appEnv.upstashRedisRestToken),
);
export const hasGoqrConfig = Boolean(
  appEnv.goqrEndpoint &&
    !isPlaceholderUrl(appEnv.goqrEndpoint) &&
    appEnv.goqrTokoName &&
    !isPlaceholderSecret(appEnv.goqrTokoName) &&
    appEnv.goqrToken &&
    !isPlaceholderSecret(appEnv.goqrToken),
);

const productionReadinessWarnings: string[] = [];

if (process.env.NODE_ENV === "production") {
  if (!hasAuthSecret) {
    productionReadinessWarnings.push(
      "AUTH_SECRET belum valid. Login admin dan verifikasi session akan gagal sampai secret produksi yang kuat diisi.",
    );
  }

  if (isPlaceholderUrl(appEnv.siteUrl) || /^https?:\/\/localhost/i.test(appEnv.siteUrl)) {
    productionReadinessWarnings.push(
      "NEXT_PUBLIC_SITE_URL masih placeholder atau localhost. Canonical URL, metadataBase, sitemap, dan validasi origin produksi akan tidak sehat.",
    );
  }

  if (!hasUpstashRedisConfig) {
    productionReadinessWarnings.push(
      "Konfigurasi Upstash Redis belum lengkap. Endpoint yang dilindungi rate limit akan menolak request pada production untuk menjaga posture keamanan.",
    );
  }

  const hasAnyGoqrConfig = Boolean(appEnv.goqrEndpoint || appEnv.goqrTokoName || appEnv.goqrToken);
  if (hasAnyGoqrConfig && !hasGoqrConfig) {
    productionReadinessWarnings.push(
      "Konfigurasi GOQR terisi parsial atau masih placeholder. Flow dukungan QRIS akan gagal sampai endpoint, nama toko, dan token valid tersedia.",
    );
  }
}

if (
  productionReadinessWarnings.length > 0 &&
  !globalForEnvWarnings.hasLoggedProductionReadinessWarnings
) {
  globalForEnvWarnings.hasLoggedProductionReadinessWarnings = true;
  console.warn("[env] production readiness warnings:", productionReadinessWarnings);
}
