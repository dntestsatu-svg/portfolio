export const SUPPORT_MIN_AMOUNT = 10_000;
export const SUPPORT_MAX_AMOUNT = 10_000_000;
export const SUPPORT_EXPIRE_SECONDS = 300;
export const SUPPORT_LEADERBOARD_PREVIEW_LIMIT = 6;
export const SUPPORT_LEADERBOARD_PAGE_SIZE = 20;

export type SupportStatus = "pending" | "success" | "failed" | "expired";

export type SupportDonorSnapshot = {
  displayName: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
  message?: string;
};

export type SupportTransactionSnapshot = {
  customRef: string;
  trxId: string;
  username: string;
  amount: number;
  amountLabel: string;
  donor: SupportDonorSnapshot;
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

export type SupportLeaderboardEntry = {
  rank: number;
  displayName: string;
  isAnonymous: boolean;
  totalAmount: number;
  totalAmountLabel: string;
  supportCount: number;
  lastSupportAtISO: string;
  lastSupportLabel: string;
  latestMessage?: string;
};

export type SupportLeaderboardSummary = {
  totalSupporters: number;
  totalSupportersLabel: string;
  totalAmount: number;
  totalAmountLabel: string;
  latestSupportAtISO?: string;
  latestSupportLabel?: string;
};

export type SupportLeaderboardPage = {
  entries: SupportLeaderboardEntry[];
  summary: SupportLeaderboardSummary;
  page: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
};
