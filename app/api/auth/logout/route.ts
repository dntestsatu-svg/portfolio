import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getSessionCookieOptions } from "@/lib/auth/session";
import { assertAdminMutationRequest, getCsrfCookieOptions } from "@/lib/security/csrf";
import { SecurityError } from "@/lib/security/security-error";
import { recordAdminAuditLogSafely } from "@/lib/services/audit-log";

export async function POST(request: NextRequest) {
  try {
    assertAdminMutationRequest(request);
    const formData = await request.formData();
    assertAdminMutationRequest(request, { formData, requireToken: true });
    const session = await getAdminSession();

    if (session) {
      await recordAdminAuditLogSafely({
        action: "logout",
        entityType: "auth",
        request,
        session,
        entityLabel: "admin-session",
      });
    }

    const response = NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: "",
      maxAge: 0,
    });

    response.cookies.set({
      ...getCsrfCookieOptions(),
      value: "",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    if (error instanceof SecurityError) {
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(error.message)}`, request.url),
        { status: 303 },
      );
    }

    return NextResponse.redirect(new URL("/admin?error=Logout%20gagal", request.url), {
      status: 303,
    });
  }
}
