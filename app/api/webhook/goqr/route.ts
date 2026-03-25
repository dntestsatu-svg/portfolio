import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { appEnv } from "@/lib/env";
import { GoqrError } from "@/lib/goqr";
import { applyGoqrWebhook, isGoqrIntegrationCheckPayload } from "@/lib/services/support";
import { goqrWebhookSchema } from "@/lib/validators";

export const runtime = "nodejs";

function hasValidCallbackSecret(request: NextRequest) {
  const expected = (appEnv.goqrWebhookSecret ?? "").trim();

  if (!expected) {
    return true;
  }

  const incoming = request.headers.get("x-callback-secret")?.trim() ?? "";

  return (
    incoming.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(incoming), Buffer.from(expected))
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!hasValidCallbackSecret(request)) {
      return NextResponse.json(
        { status: false, error: "Invalid callback secret." },
        { status: 401 },
      );
    }

    const rawText = await request.text();
    const payload = rawText.trim().length > 0 ? JSON.parse(rawText) : {};

    if (isGoqrIntegrationCheckPayload(payload)) {
      return NextResponse.json(
        {
          success: true,
          status: true,
          message: "GOQR webhook integration check acknowledged.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    const input = goqrWebhookSchema.parse(payload);
    const result = await applyGoqrWebhook(input);

    return NextResponse.json(
      {
        status: true,
        message:
          result.action === "updated"
            ? "Webhook processed."
            : "Webhook acknowledged without mutation.",
        transaction: {
          custom_ref: result.transaction.customRef,
          trx_id: result.transaction.trxId,
          status: result.transaction.status,
        },
      },
      {
        status: 202,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    const status = error instanceof GoqrError ? error.status : 400;

    return NextResponse.json(
      {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook GOQR gagal diproses.",
      },
      { status },
    );
  }
}
