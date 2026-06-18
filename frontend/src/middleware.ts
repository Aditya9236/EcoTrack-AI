import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Protected routes that require authentication */
const PROTECTED = ['/dashboard', '/calculator', '/tracker', '/scanner', '/predictor', '/leaderboard', '/agents', '/chat'];
/** Auth routes that redirect authenticated users away */
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('__session')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
