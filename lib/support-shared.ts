export const SUPPORT_MIN_AMOUNT = 10_000;
export const SUPPORT_MAX_AMOUNT = 10_000_000;
export const SUPPORT_EXPIRE_SECONDS = 300;

export type SupportStatus = "pending" | "success" | "failed" | "expired";

export type SupportTransactionSnapshot = {
  customRef: string;
  trxId: string;
  username: string;
  amount: number;
  amountLabel: string;
  status: SupportStatus;
  statusLabel: string;
  statusTone: "accent" | "success" | "muted" | "danger";
  vendor?: string;
  rrn?: string;
  merchantId?: string;
  createdAtISO: string;
  updatedAtISO: string;
  finishedAtISO?: string;
  expiresAtISO: string;
  isExpired: boolean;
};
