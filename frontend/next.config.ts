// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

// Seule adresse que le navigateur a le droit d'appeler : l'API Laravel
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').origin;

// Content-Security-Policy : limite ce que la page peut charger et vers où elle peut envoyer des données.
// Si un jour un script malveillant était injecté, il ne pourrait ni charger de code externe,
// ni envoyer le token de connexion ailleurs que vers notre API (connect-src).
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' : nécessaire aux scripts que Next.js insère dans la page ; 'unsafe-eval' en dev seulement
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // https: — les logos de partenaires peuvent venir de n'importe quel site saisi par l'admin
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? ' ws: http://localhost:* http://127.0.0.1:*' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Force le HTTPS pour tout ce que charge la page (seulement si l'API est elle-même en HTTPS)
  ...(apiOrigin.startsWith('https:') ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // HTTPS obligatoire pendant 2 ans, sous-domaines compris
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Le site ne peut pas être affiché dans un cadre (protection contre le « clickjacking »)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  // Ne pas annoncer « X-Powered-By: Next.js » (aide les attaquants à cibler les failles connues)
  poweredByHeader: false,
  images: {
    // Qualités autorisées pour next/image (couvertures nettes dans la fiche du livre)
    qualities: [40, 75, 85, 90],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
