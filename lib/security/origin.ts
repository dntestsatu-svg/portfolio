import type { NextRequest } from "next/server";
import { appEnv } from "@/lib/env";
import { SecurityError } from "@/lib/security/security-error";

function parseOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: NextRequest) {
  const allowedOrigins = new Set<string>([request.nextUrl.origin]);

  const configuredSiteOrigin = parseOrigin(appEnv.siteUrl);
  if (configuredSiteOrigin) {
    allowedOrigins.add(configuredSiteOrigin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    allowedOrigins.add(`${forwardedProto}://${forwardedHost}`);
  }

  return allowedOrigins;
}

export function assertTrustedOrigin(request: NextRequest) {
  const origin = parseOrigin(request.headers.get("origin"));
  const referer = parseOrigin(request.headers.get("referer"));
  const candidate = origin ?? referer;

  if (!candidate) {
    throw new SecurityError("Origin atau referer wajib dikirim.", { status: 403 });
  }

  if (!getAllowedOrigins(request).has(candidate)) {
    throw new SecurityError("Origin atau referer tidak diizinkan.", { status: 403 });
  }
}
