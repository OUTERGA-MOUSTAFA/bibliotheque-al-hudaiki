// Bordure inspirée des tapis amazighs de l'Anti-Atlas (losanges et zigzags).
// Utilisée comme seuil entre le paysage du hero et le contenu.
export default function AmazighBand({ className = '' }: { className?: string }) {
  return (
    <div className={`h-6 w-full ${className}`} aria-hidden>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <pattern id="amazigh-band" width="48" height="24" patternUnits="userSpaceOnUse">
            <rect width="48" height="24" fill="#1d2747" />
            {/* Losange central, avec son cœur safran */}
            <path d="M24 3 L35 12 L24 21 L13 12 Z" fill="#c87157" />
            <path d="M24 8 L29 12 L24 16 L19 12 Z" fill="#e5a833" />
            {/* Demi-losanges aux extrémités : la frise se raccorde d'un motif à l'autre */}
            <path d="M0 3 L11 12 L0 21 Z" fill="#f1c4b5" />
            <path d="M48 3 L37 12 L48 21 Z" fill="#f1c4b5" />
            {/* Fines dents en haut et en bas */}
            <path d="M0 0 L6 3 L12 0 L18 3 L24 0 L30 3 L36 0 L42 3 L48 0 Z" fill="#fbf5f2" opacity="0.9" />
            <path d="M0 24 L6 21 L12 24 L18 21 L24 24 L30 21 L36 24 L42 21 L48 24 Z" fill="#fbf5f2" opacity="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#amazigh-band)" />
      </svg>
    </div>
  );
}
