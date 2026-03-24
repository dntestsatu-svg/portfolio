import { appEnv, hasGoqrConfig } from "@/lib/env";

const GOQR_GENERATE_PATH = "/payments/gateway/generate";

export class GoqrError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "GoqrError";
    this.status = status;
  }
}

type GenerateSupportQrOptions = {
  amount: number;
  expireSeconds: number;
  customRef: string;
  username: string;
};

type GoqrGenerateEnvelope = {
  status?: boolean | string;
  data?: string | { data?: string; trx_id?: string; expired_at?: number | null };
  trx_id?: string;
  expired_at?: number | null;
  error?: string;
  message?: string;
};

type NormalizedGenerateResponse = {
  success: boolean;
  qrisPayload: string | null;
  trxId: string | null;
  expiredAt: number | null;
};

function assertGoqrConfiguration() {
  if (!hasGoqrConfig) {
    throw new GoqrError(
      "Konfigurasi GOQR belum lengkap. Isi API_GOQR_ENDPOINT, API_GOQR_TOKONAME, dan API_GOQR_TOKEN.",
      503,
    );
  }
}

function getGoqrEndpoint(pathname: string) {
  return new URL(pathname, appEnv.goqrEndpoint).toString();
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = "error" in payload ? payload.error : "message" in payload ? payload.message : null;
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

function normalizeGenerateResponse(payload: GoqrGenerateEnvelope | null): NormalizedGenerateResponse {
  if (!payload) {
    return {
      success: false,
      qrisPayload: null,
      trxId: null,
      expiredAt: null,
    };
  }

  const success =
    payload.status === true ||
    payload.status === "true" ||
    payload.status === "success";

  if (typeof payload.data === "string") {
    return {
      success,
      qrisPayload: payload.data,
      trxId: typeof payload.trx_id === "string" ? payload.trx_id : null,
      expiredAt: typeof payload.expired_at === "number" ? payload.expired_at : null,
    };
  }

  if (payload.data && typeof payload.data === "object") {
    return {
      success,
      qrisPayload: typeof payload.data.data === "string" ? payload.data.data : null,
      trxId: typeof payload.data.trx_id === "string" ? payload.data.trx_id : null,
      expiredAt: typeof payload.data.expired_at === "number" ? payload.data.expired_at : null,
    };
  }

  return {
    success,
    qrisPayload: null,
    trxId: null,
    expiredAt: null,
  };
}

export async function generateSupportQr(options: GenerateSupportQrOptions) {
  assertGoqrConfiguration();

  const response = await fetch(getGoqrEndpoint(GOQR_GENERATE_PATH), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appEnv.goqrToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: options.username,
      amount: options.amount,
      expire: options.expireSeconds,
      custom_ref: options.customRef,
    }),
    cache: "no-store",
  });

  const rawText = await response.text();
  let payload: GoqrGenerateEnvelope | null = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  const upstreamMessage = getErrorMessage(payload);
  const normalized = normalizeGenerateResponse(payload);

  if (!response.ok) {
    throw new GoqrError(
      upstreamMessage ?? "Gateway QRIS tidak merespons dengan baik.",
      response.status,
    );
  }

  if (!normalized.success) {
    throw new GoqrError(
      upstreamMessage ?? "Gateway QRIS sedang mengalami gangguan.",
      502,
    );
  }

  if (!normalized.qrisPayload || normalized.qrisPayload.trim().length === 0) {
    throw new GoqrError("Payload QRIS dari gateway tidak valid.", 502);
  }

  if (!normalized.trxId || normalized.trxId.trim().length === 0) {
    throw new GoqrError("trx_id dari gateway tidak tersedia.", 502);
  }

  return {
    qrisPayload: normalized.qrisPayload.trim(),
    trxId: normalized.trxId.trim(),
    expiredAt:
      typeof normalized.expiredAt === "number" && Number.isFinite(normalized.expiredAt)
        ? new Date(normalized.expiredAt * 1000)
        : null,
    rawGenerate: payload,
  };
}
