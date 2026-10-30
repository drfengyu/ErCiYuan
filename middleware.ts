import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, verifySessionToken } from './lib/session';

const PROTECTED = ['/ucenter', '/order', '/admin'];

function targetPath(req: NextRequest) {
  const search = req.nextUrl.search || '';
  return `${req.nextUrl.pathname}${search}`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(AUTH_COOKIE)?.value ?? '');
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', targetPath(req));

  if (!session) return NextResponse.redirect(loginUrl);

  if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ucenter/:path*', '/order/:path*', '/admin/:path*'],
};
