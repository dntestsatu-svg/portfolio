import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { formDataToObject, isFormRequest } from "@/lib/request";
import { createContactMessage, getContactMessages } from "@/lib/services/content";
import { assertTrustedOrigin } from "@/lib/security/origin";
import { assertRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { SecurityError } from "@/lib/security/security-error";
import { contactSchema } from "@/lib/validators";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getContactMessages(), {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const formSubmission = isFormRequest(request);
  let formData: FormData | null = null;

  try {
    assertTrustedOrigin(request);
    await assertRateLimit({
      namespace: "contact-form",
      key: getClientIp(request),
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: "Terlalu banyak pesan dikirim. Coba lagi beberapa saat lagi.",
    });

    if (formSubmission) {
      formData = await request.formData();
    }

    const payload = formData ? formDataToObject(formData) : await request.json();

    const input = contactSchema.parse(payload);
    const message = await createContactMessage(input);

    if (formSubmission) {
      return NextResponse.redirect(new URL("/?contact=success#contact", request.url), {
        status: 303,
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    if (formSubmission) {
      return NextResponse.redirect(
        new URL(
          `/?contact=error&message=${encodeURIComponent(
            error instanceof Error ? error.message : "Pesan gagal dikirim.",
          )}#contact`,
          request.url,
        ),
        { status: 303 },
      );
    }

    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Pesan gagal dikirim." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
