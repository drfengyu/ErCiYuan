import { NextResponse } from 'next/server';
import { getCurrentUser, type Role } from './auth';

export function ok<T>(data?: T, message = '成功') {
  return NextResponse.json({ success: true, code: 20000, message, data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, code: status, message }, { status });
}

/**
 * 只验 JWT 是不够的：账号被禁用或删除后，token 在 7 天有效期内仍然自洽。
 * 所以每次带鉴权的接口都回查一次用户表。
 */
async function sessionOf(): Promise<{ userId: string; role: Role } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { userId: user.id, role: user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER' };
}

export async function requireApiUser() {
  return sessionOf();
}

export async function requireApiAdmin() {
  const session = await sessionOf();
  return session?.role === 'ADMIN' ? session : null;
}
