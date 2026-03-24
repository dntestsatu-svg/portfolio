import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { appEnv, hasAuthSecret } from "@/lib/env";

const encoder = new TextEncoder();
const secret = hasAuthSecret ? encoder.encode(appEnv.authSecret) : null;

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminSession = {
  userId: string;
  email: string;
  name?: string | null;
};

type SessionPayload = {
  sub: string;
  email: string;
  name?: string | null;
};

function ensureSecret() {
  if (!secret) {
    throw new Error("AUTH_SECRET belum dikonfigurasi.");
  }

  return secret;
}

export async function signAdminSession(session: AdminSession) {
  return new SignJWT({
    email: session.email,
    name: session.name ?? undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(ensureSecret());
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const verified = await jwtVerify<SessionPayload>(token, ensureSecret());

    return {
      userId: verified.payload.sub ?? "",
      email: verified.payload.email,
      name: verified.payload.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  return verifyAdminSession(rawToken);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
