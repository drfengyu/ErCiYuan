import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE = 'token';

export type Role = 'ADMIN' | 'MEMBER';
export type Session = { userId: string; role: Role };

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'erciyuan-dev-secret-change-me-in-production',
);

export async function createSessionToken(userId: string, role: Role): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { userId: payload.sub, role: payload.role === 'ADMIN' ? 'ADMIN' : 'MEMBER' };
  } catch {
    return null;
  }
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};
