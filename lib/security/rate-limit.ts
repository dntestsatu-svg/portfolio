import crypto from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { appEnv, hasUpstashRedisConfig } from "@/lib/env";
import { SecurityError } from "@/lib/security/security-error";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  upstashRedis?: Redis;
  upstashRateLimiters?: Map<string, Ratelimit>;
  devRateLimitStore?: Map<string, RateLimitEntry>;
};

function getRedisClient() {
  if (!hasUpstashRedisConfig) {
    return null;
  }

  if (!globalForRateLimit.upstashRedis) {
    globalForRateLimit.upstashRedis = new Redis({
      url: appEnv.upstashRedisRestUrl!,
      token: appEnv.upstashRedisRestToken!,
    });
  }

  return globalForRateLimit.upstashRedis;
}

function getRateLimiter(options: {
  namespace: string;
  limit: number;
  windowMs: number;
}) {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  const cacheKey = `${options.namespace}:${options.limit}:${options.windowMs}`;

  if (!globalForRateLimit.upstashRateLimiters) {
    globalForRateLimit.upstashRateLimiters = new Map<string, Ratelimit>();
  }

  const existing = globalForRateLimit.upstashRateLimiters.get(cacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.limit, `${Math.ceil(options.windowMs / 1000)} s`),
    analytics: true,
    ephemeralCache: false,
    prefix: `my-portfolio:${options.namespace}`,
  });

  globalForRateLimit.upstashRateLimiters.set(cacheKey, limiter);

  return limiter;
}

function getDevRateLimitStore() {
  if (!globalForRateLimit.devRateLimitStore) {
    globalForRateLimit.devRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalForRateLimit.devRateLimitStore;
}

function cleanupExpiredEntries(now: number) {
  const store = getDevRateLimitStore();

  if (store.size < 5000) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function assertDevelopmentRateLimit(options: {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
  message: string;
}) {
  const now = Date.now();
  const store = getDevRateLimitStore();
  cleanupExpiredEntries(now);

  const bucketKey = `${options.namespace}:${options.key}`;
  const existing = store.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    store.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    throw new SecurityError(options.message, {
      status: 429,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    });
  }

  existing.count += 1;
  store.set(bucketKey, existing);
}

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function hashRateLimitKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("base64url");
}

export async function assertRateLimit(options: {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
  message: string;
}) {
  const limiter = getRateLimiter(options);

  if (limiter) {
    const result = await limiter.limit(options.key);
    void result.pending.catch(() => undefined);

    if (!result.success) {
      throw new SecurityError(options.message, {
        status: 429,
        retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      });
    }

    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new SecurityError(
      "Rate limiter produksi belum dikonfigurasi. Isi kredensial Upstash Redis.",
      { status: 503 },
    );
  }

  assertDevelopmentRateLimit(options);
}
