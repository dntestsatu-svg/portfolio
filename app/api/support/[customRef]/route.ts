import { NextRequest, NextResponse } from "next/server";
import { GoqrError } from "@/lib/goqr";
import { getSupportTransactionByCustomRef } from "@/lib/services/support";
import { assertRateLimit, getClientIp, hashRateLimitKey } from "@/lib/security/rate-limit";
import { SecurityError } from "@/lib/security/security-error";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ customRef: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await assertRateLimit({
      namespace: "support-status",
      key: hashRateLimitKey(getClientIp(request)),
      limit: 120,
      windowMs: 10 * 60 * 1000,
      message: "Terlalu banyak pengecekan status. Coba lagi sebentar.",
    });

    const { customRef } = await params;
    const transaction = await getSupportTransactionByCustomRef(customRef);

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi dukungan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(transaction, {
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
            : "Status dukungan belum bisa diambil.",
      },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
