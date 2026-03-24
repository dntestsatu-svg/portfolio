export class SecurityError extends Error {
  status: number;
  retryAfter?: number;
  code?: string;

  constructor(
    message: string,
    options?: { status?: number; retryAfter?: number; code?: string },
  ) {
    super(message);
    this.name = "SecurityError";
    this.status = options?.status ?? 403;
    this.retryAfter = options?.retryAfter;
    this.code = options?.code;
  }
}
