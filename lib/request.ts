import { NextRequest, NextResponse } from "next/server";
import { getPublicRequestOrigin } from "@/lib/security/origin";

export function isFormRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  return (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  );
}

export function formDataToObject(formData: FormData) {
  const result: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
}

export function buildPublicUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, getPublicRequestOrigin(request));
}

export function redirectWithSearch(
  request: NextRequest,
  pathname: string,
  params: Record<string, string>,
) {
  const url = buildPublicUrl(request, pathname);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url, { status: 303 });
}
