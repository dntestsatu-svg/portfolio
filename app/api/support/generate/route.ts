import { NextRequest, NextResponse } from "next/server";
import { generateSupportTransaction } from "@/lib/services/support";
import { assertTrustedOrigin } from "@/lib/security/origin";
import { assertRateLimit, getClientIp, hashRateLimitKey } from "@/lib/security/rate-limit";
import { SecurityError } from "@/lib/security/security-error";
import { supportGenerateSchema } from "@/lib/validators";
import { GoqrError } from "@/lib/goqr";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);
    await assertRateLimit({
      namespace: "support-generate",
      key: hashRateLimitKey(getClientIp(request)),
      limit: 8,
      windowMs: 15 * 60 * 1000,
      message: "Terlalu banyak permintaan QRIS. Coba lagi beberapa menit lagi.",
    });

    const input = supportGenerateSchema.parse(await request.json());
    const result = await generateSupportTransaction(input);

    return NextResponse.json(result, {
      status: 201,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status =
      error instanceof SecurityError
        ? error.status
        : error instanceof GoqrError
          ? error.status
          : 400;
    const response = NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "QRIS belum bisa dibuat. Silakan coba lagi.",
      },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
