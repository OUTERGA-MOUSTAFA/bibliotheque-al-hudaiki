import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // /compte et /admin sont protégés côté client par ProtectedRoute (le token est dans localStorage,
  // invisible ici). La vraie protection reste l'API : role:admin et auth:sanctum.
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};