import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true, code: 20000, message: '已退出登录', data: null });
  res.cookies.set(AUTH_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

export async function GET() {
  return POST();
}
