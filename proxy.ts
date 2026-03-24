import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, getCsrfCookieOptions, generateCsrfToken } from "@/lib/security/csrf";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value ?? generateCsrfToken();
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set(CSRF_HEADER_NAME, csrfToken);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

    if (!hasSessionCookie) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));

      if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
        response.cookies.set({
          ...getCsrfCookieOptions(),
          value: csrfToken,
        });
      }

      return response;
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
    response.cookies.set({
      ...getCsrfCookieOptions(),
      value: csrfToken,
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
