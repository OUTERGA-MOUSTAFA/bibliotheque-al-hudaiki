// src/app/global-not-found.tsx
import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h1>404 — Page introuvable</h1>
          <p>الصفحة غير موجودة</p>
          <Link href="/fr" style={{ color: 'green', marginTop: 20, display: 'block' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}