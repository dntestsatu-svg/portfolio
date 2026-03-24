import crypto from "node:crypto";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { assertTrustedOrigin } from "@/lib/security/origin";
import { SecurityError } from "@/lib/security/security-error";

export const CSRF_COOKIE_NAME = "admin_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_FORM_FIELD_NAME = "_csrf";

const CSRF_MAX_AGE = 60 * 60 * 12;

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getCsrfCookieOptions() {
  return {
    name: CSRF_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CSRF_MAX_AGE,
  };
}

export async function getServerCsrfToken() {
  const headerStore = await headers();
  return headerStore.get(CSRF_HEADER_NAME) ?? "";
}

function getSubmittedCsrfToken(request: NextRequest, formData?: FormData | null) {
  const formToken = formData?.get(CSRF_FORM_FIELD_NAME);
  if (typeof formToken === "string" && formToken.length > 0) {
    return formToken;
  }

  return request.headers.get(CSRF_HEADER_NAME);
}

export function assertAdminCsrf(request: NextRequest, formData?: FormData | null) {
  assertTrustedOrigin(request);

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const submittedToken = getSubmittedCsrfToken(request, formData);

  if (!cookieToken || !submittedToken) {
    throw new SecurityError("CSRF token wajib disertakan.", { status: 403 });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const submittedBuffer = Buffer.from(submittedToken);

  if (
    cookieBuffer.length !== submittedBuffer.length ||
    !crypto.timingSafeEqual(cookieBuffer, submittedBuffer)
  ) {
    throw new SecurityError("CSRF token tidak valid.", { status: 403 });
  }
}

export function assertAdminMutationRequest(
  request: NextRequest,
  options?: { formData?: FormData | null; requireToken?: boolean },
) {
  if (options?.requireToken) {
    assertAdminCsrf(request, options.formData);
    return;
  }

  assertTrustedOrigin(request);
}
