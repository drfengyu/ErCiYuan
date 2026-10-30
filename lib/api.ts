import { NextResponse } from 'next/server';
import { readSession, type Role } from './auth';

export function ok<T>(data?: T, message = '成功') {
  return NextResponse.json({ success: true, code: 20000, message, data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, code: status, message }, { status });
}

export async function requireApiUser(): Promise<{ userId: string; role: Role } | null> {
  const session = await readSession();
  return session;
}

export async function requireApiAdmin(): Promise<{ userId: string; role: Role } | null> {
  const session = await readSession();
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}
