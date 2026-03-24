import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/services/admin-auth";
import { buildPublicUrl, formDataToObject, isFormRequest, redirectWithSearch } from "@/lib/request";
import { getSessionCookieOptions, signAdminSession } from "@/lib/auth/session";
import { assertAdminMutationRequest } from "@/lib/security/csrf";
import { assertRateLimit, getClientIp, hashRateLimitKey } from "@/lib/security/rate-limit";
import { SecurityError } from "@/lib/security/security-error";
import {
  recordAdminAuditLogSafely,
  recordFailedLoginAuditLogSafely,
} from "@/lib/services/audit-log";
import { loginSchema } from "@/lib/validators";
import { ZodError } from "zod";

function getLoginIdentifier(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("email" in payload)) {
    return "unknown";
  }

  const email = payload.email;
  if (typeof email !== "string") {
    return "unknown";
  }

  return email.trim().toLowerCase().slice(0, 190) || "unknown";
}

async function assertLoginRateLimit(request: NextRequest, identifier: string) {
  const ip = getClientIp(request);

  if (identifier !== "unknown") {
    try {
      await assertRateLimit({
        namespace: "admin-login-pair",
        key: hashRateLimitKey(`pair:${ip}:${identifier}`),
        limit: 5,
        windowMs: 10 * 60 * 1000,
        message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
      });
    } catch (error) {
      if (error instanceof SecurityError) {
        throw new SecurityError(error.message, {
          status: error.status,
          retryAfter: error.retryAfter,
          code: "rate_limited_pair",
        });
      }

      throw error;
    }

    try {
      await assertRateLimit({
        namespace: "admin-login-identifier",
        key: hashRateLimitKey(`identifier:${identifier}`),
        limit: 8,
        windowMs: 10 * 60 * 1000,
        message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
      });
    } catch (error) {
      if (error instanceof SecurityError) {
        throw new SecurityError(error.message, {
          status: error.status,
          retryAfter: error.retryAfter,
          code: "rate_limited_identifier",
        });
      }

      throw error;
    }
  }

  try {
    await assertRateLimit({
      namespace: "admin-login-ip",
      key: hashRateLimitKey(`ip:${ip}`),
      limit: 30,
      windowMs: 10 * 60 * 1000,
      message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
    });
  } catch (error) {
    if (error instanceof SecurityError) {
      throw new SecurityError(error.message, {
        status: error.status,
        retryAfter: error.retryAfter,
        code: "rate_limited_ip",
      });
    }

    throw error;
  }
}

function getLoginFailureCategory(error: unknown) {
  if (error instanceof ZodError) {
    return "invalid_payload";
  }

  if (error instanceof SyntaxError) {
    return "invalid_payload";
  }

  if (error instanceof SecurityError) {
    return error.code ?? (error.status === 429 ? "rate_limited_ip" : "request_rejected");
  }

  return "internal_error";
}

export async function POST(request: NextRequest) {
  const formSubmission = isFormRequest(request);
  let formData: FormData | null = null;
  let payload: Record<string, string> | unknown = {};
  let attemptedIdentifier = "unknown";

  try {
    if (formSubmission) {
      assertAdminMutationRequest(request);
      formData = await request.formData();
    }

    assertAdminMutationRequest(request, {
      formData,
      requireToken: true,
    });

    payload = formData ? formDataToObject(formData) : await request.json();
    attemptedIdentifier = getLoginIdentifier(payload);
    await assertLoginRateLimit(request, attemptedIdentifier);

    const input = loginSchema.parse(payload);
    const session = await authenticateAdmin(input);

    if (!session) {
      await recordFailedLoginAuditLogSafely({
        request,
        identifier: attemptedIdentifier,
        failureCategory: "invalid_credentials",
        transport: formSubmission ? "form" : "json",
      });

      if (formSubmission) {
        return redirectWithSearch(request, "/admin/login", {
          error: "Email atau password tidak valid.",
        });
      }

      return NextResponse.json(
        { error: "Email atau password tidak valid." },
        { status: 401 },
      );
    }

    const token = await signAdminSession(session);
    await recordAdminAuditLogSafely({
      action: "login",
      entityType: "auth",
      request,
      session,
      entityLabel: "admin-session",
      metadata: {
        transport: formSubmission ? "form" : "json",
      },
    });

    if (formSubmission) {
      const response = NextResponse.redirect(buildPublicUrl(request, "/admin"), {
        status: 303,
      });

      response.cookies.set({
        ...getSessionCookieOptions(),
        value: token,
      });

      return response;
    }

    const response = NextResponse.json({
      success: true,
      user: session,
    });

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (error) {
    await recordFailedLoginAuditLogSafely({
      request,
      identifier: attemptedIdentifier,
      failureCategory: getLoginFailureCategory(error),
      transport: formSubmission ? "form" : "json",
      metadata:
        error instanceof SecurityError
          ? {
              status: error.status,
            }
          : undefined,
    });

    if (formSubmission) {
      return redirectWithSearch(request, "/admin/login", {
        error: error instanceof Error ? error.message : "Login gagal.",
      });
    }

    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Login gagal." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
