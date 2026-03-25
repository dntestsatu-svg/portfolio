import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getSessionCookieOptions } from "@/lib/auth/session";
import { buildPublicUrl } from "@/lib/request";
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

    const response = NextResponse.redirect(buildPublicUrl(request, "/admin/login"), {
      status: 303,
    });
    response.headers.set("Cache-Control", "private, no-store");

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
      const response = NextResponse.redirect(
        buildPublicUrl(request, `/admin?error=${encodeURIComponent(error.message)}`),
        { status: 303 },
      );
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }

    const response = NextResponse.redirect(buildPublicUrl(request, "/admin?error=Logout%20gagal"), {
      status: 303,
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
