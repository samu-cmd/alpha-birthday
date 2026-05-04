import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "simukelo@alpha.co.za";
const ADMIN_PASSWORD = "test@12345";
const SESSION_COOKIE = "alpha-birthday-admin";
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "alpha-birthday-local-session-secret";

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function buildToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      issuedAt: Date.now(),
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function parseToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      issuedAt?: number;
    };
  } catch {
    return null;
  }
}

export function isAdminCredentials(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, buildToken(ADMIN_EMAIL), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = parseToken(token);

  if (payload?.email !== ADMIN_EMAIL) {
    return null;
  }

  return {
    email: ADMIN_EMAIL,
  };
}

export async function isAdminLoggedIn() {
  const session = await getAdminSession();
  return Boolean(session);
}

export { ADMIN_EMAIL };
