import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées
  const isProtected = pathname.includes('/compte') || pathname.includes('/admin');

  if (isProtected) {
    // On laisse le composant ProtectedRoute gérer la redirection
    // (côté client, avec le token localStorage)
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};