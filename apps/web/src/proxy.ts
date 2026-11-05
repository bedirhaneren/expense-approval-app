import { NextResponse, type NextRequest } from 'next/server';
import { LOGIN_PATH } from './lib/routes';
import { SESSION_COOKIE } from './lib/session-cookie';

/**
 * Optimistic check only: sends visitors without a session cookie to the login
 * page. The real checks happen in the Data Access Layer and in the API.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
