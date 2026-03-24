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

function getForwardedHeaderValue(request: NextRequest, name: string) {
  const value = request.headers.get(name)?.split(",")[0]?.trim();
  return value && value.length > 0 ? value : null;
}

function getForwardedOrigin(request: NextRequest) {
  const forwardedHost = getForwardedHeaderValue(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeaderValue(request, "x-forwarded-proto");

  if (!forwardedHost || !forwardedProto) {
    return null;
  }

  return `${forwardedProto}://${forwardedHost}`;
}

export function getPublicRequestOrigin(request: NextRequest) {
  return (
    getForwardedOrigin(request) ??
    parseOrigin(appEnv.siteUrl) ??
    request.nextUrl.origin
  );
}

function getAllowedOrigins(request: NextRequest) {
  const allowedOrigins = new Set<string>([request.nextUrl.origin, getPublicRequestOrigin(request)]);

  const configuredSiteOrigin = parseOrigin(appEnv.siteUrl);
  if (configuredSiteOrigin) {
    allowedOrigins.add(configuredSiteOrigin);
  }

  const forwardedOrigin = getForwardedOrigin(request);
  if (forwardedOrigin) {
    allowedOrigins.add(forwardedOrigin);
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
