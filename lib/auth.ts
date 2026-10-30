import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users, type User } from './db/schema';
import { AUTH_COOKIE, verifySessionToken, type Session } from './session';

export { AUTH_COOKIE, authCookieOptions, createSessionToken, type Role, type Session } from './session';

export async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  const { db } = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || user.disabled) return null;
  return user;
}

export async function requireUser(next = '/ucenter'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'ADMIN') redirect('/');
  return user;
}
