import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE = 'token';

export type Role = 'ADMIN' | 'MEMBER';
export type Session = { userId: string; role: Role };

const AUTH_SECRET = process.env.AUTH_SECRET;

// 部署到 Vercel 却没配密钥时必须直接失败：占位密钥写在公开源码里，任何人可伪造管理员 token。
if (!AUTH_SECRET && process.env.VERCEL === '1' && process.env.NODE_ENV === 'production') {
  throw new Error('缺少环境变量 AUTH_SECRET，请在 Vercel 项目环境变量中配置后重新部署。');
}

const secret = new TextEncoder().encode(AUTH_SECRET || 'erciyuan-dev-secret-change-me-in-production');

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
