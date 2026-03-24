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

if (!parsedEnv.success) {
  console.warn("Beberapa environment variable tidak valid:", parsedEnv.error.flatten().fieldErrors);
}

const env = parsedEnv.success ? parsedEnv.data : process.env;

export const appEnv = {
  databaseUrl: env.DATABASE_URL,
  authSecret: env.AUTH_SECRET,
  adminEmail: env.ADMIN_EMAIL,
  adminPassword: env.ADMIN_PASSWORD,
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN,
  auditLogRetentionDays: env.AUDIT_LOG_RETENTION_DAYS,
  auditFailedLoginAlertThreshold: env.AUDIT_FAILED_LOGIN_ALERT_THRESHOLD,
  auditFailedLoginAlertWindowMinutes: env.AUDIT_FAILED_LOGIN_ALERT_WINDOW_MINUTES,
  auditExportMaxRows: env.AUDIT_EXPORT_MAX_ROWS,
  auditExportMaxDays: env.AUDIT_EXPORT_MAX_DAYS,
  siteUrl: env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL,
  githubUrl: env.NEXT_PUBLIC_GITHUB_URL,
  linkedinUrl: env.NEXT_PUBLIC_LINKEDIN_URL,
  goqrEndpoint: env.API_GOQR_ENDPOINT,
  goqrTokoName: env.API_GOQR_TOKONAME,
  goqrToken: env.API_GOQR_TOKEN,
  goqrWebhookSecret: env.API_GOQR_WEBHOOK_SECRET,
};

export const hasDatabaseConfig = Boolean(appEnv.databaseUrl);
export const hasAuthSecret = Boolean(appEnv.authSecret);
export const hasUpstashRedisConfig = Boolean(
  appEnv.upstashRedisRestUrl && appEnv.upstashRedisRestToken,
);
export const hasGoqrConfig = Boolean(
  appEnv.goqrEndpoint && appEnv.goqrTokoName && appEnv.goqrToken,
);
