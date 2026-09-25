// src/app/global-not-found.tsx
export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h1>404 — Page introuvable</h1>
          <p>الصفحة غير موجودة</p>
          <a href="/fr" style={{ color: 'green', marginTop: 20, display: 'block' }}>
            ← Retour à l'accueil
          </a>
        </div>
      </body>
    </html>
  );
}