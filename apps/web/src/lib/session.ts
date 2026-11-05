import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './session-cookie';

/** Matches the API token lifetime (8 hours). */
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/**
 * The API access token lives in an httpOnly cookie, so browser JavaScript can
 * never read it. Only Next.js server code forwards it to the API.
 */
export async function saveSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
