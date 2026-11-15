// Paysage de Tafraout dessiné en SVG : crête lointaine de l'Anti-Atlas, chaos de rochers de granit rose
// empilés (la signature de la vallée des Ameln), maisons ocre et palmiers de l'oasis.
// « hero » : en couleurs, les trois plans se lèvent une fois au chargement.
// « silhouette » : une seule couleur, pour le haut du pied de page.

type Props = { variant?: 'hero' | 'silhouette'; className?: string; color?: string };

// Rochers : [cx, cy, rx, ry]. Empilés comme les blocs arrondis de Tafraout.
const ROCHERS_MILIEU: [number, number, number, number][] = [
  [150, 300, 150, 72], [330, 282, 112, 84], [482, 305, 168, 64], [660, 292, 122, 74],
  [840, 310, 186, 70], [1030, 288, 134, 86], [1205, 305, 172, 70], [1385, 290, 134, 82],
  // blocs posés sur les autres
  [318, 212, 58, 44], [350, 180, 34, 27], [1032, 210, 62, 46], [1004, 178, 31, 25], [668, 228, 50, 37],
];
const ROCHERS_AVANT: [number, number, number, number][] = [
  [40, 365, 190, 74], [300, 372, 210, 64], [575, 362, 176, 58], [860, 372, 230, 68],
  [1150, 362, 196, 62], [1410, 368, 190, 70], [230, 318, 70, 48], [1240, 316, 76, 50],
];

function Palmier({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M-3 0 C-1 -28 3 -52 1 -78 L5 -78 C7 -52 4 -28 4 0 Z" />
      <path d="M3 -80 C-14 -96 -34 -94 -46 -86 C-30 -88 -16 -84 3 -76 Z" />
      <path d="M3 -80 C18 -98 40 -96 50 -86 C34 -88 20 -84 3 -76 Z" />
      <path d="M3 -80 C-6 -100 -2 -114 6 -122 C4 -108 6 -94 5 -78 Z" />
      <path d="M3 -80 C-24 -82 -38 -70 -42 -60 C-28 -70 -14 -74 3 -76 Z" />
      <path d="M3 -80 C28 -82 42 -70 46 -60 C32 -70 18 -74 3 -76 Z" />
    </g>
  );
}

export default function GraniteLandscape({ variant = 'hero', className = '', color = '#1d2747' }: Props) {
  const anim = (delai: number) =>
    variant === 'hero' ? { className: 'animate-rock-rise', style: { animationDelay: `${delai}ms` } } : {};

  if (variant === 'silhouette') {
    return (
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className={className} aria-hidden fill={color}>
        <path d="M0 140 L0 92 C60 70 110 64 160 78 C190 50 240 44 280 66 C300 44 340 40 360 62 C410 58 450 76 490 82 C540 60 600 58 640 78 C690 70 720 86 760 88 C800 56 860 50 900 74 C930 58 990 52 1030 72 C1060 50 1100 46 1130 70 C1180 68 1220 80 1260 84 C1300 64 1360 60 1400 76 L1440 82 L1440 140 Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="gl-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efb7a1" />
          <stop offset="1" stopColor="#d88a70" />
        </linearGradient>
        <linearGradient id="gl-avant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c87157" />
          <stop offset="1" stopColor="#8a4837" />
        </linearGradient>
      </defs>

      {/* Crête lointaine de l'Anti-Atlas, dans la brume du soir */}
      <g {...anim(0)}>
        <path
          fill="#45507e"
          opacity="0.75"
          d="M0 250 C90 214 170 228 250 204 C330 178 400 196 470 186 C560 170 610 150 690 172 C760 190 820 160 900 150 C980 140 1040 170 1120 162 C1200 154 1260 180 1340 176 C1390 174 1420 182 1440 186 L1440 400 L0 400 Z"
        />
      </g>

      {/* Rochers de granit rose et village */}
      <g {...anim(140)}>
        {ROCHERS_MILIEU.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#gl-mid)" />
        ))}
        {/* Reflets de lumière sur le haut des blocs */}
        {ROCHERS_MILIEU.slice(0, 8).map(([cx, cy, rx, ry], i) => (
          <ellipse key={`r${i}`} cx={cx - rx * 0.28} cy={cy - ry * 0.55} rx={rx * 0.42} ry={ry * 0.16} fill="#f8e0d7" opacity="0.3" />
        ))}
        {/* Maisons ocre aux encadrements blancs, nichées entre les rochers */}
        <g>
          <rect x="560" y="236" width="34" height="28" fill="#c8893e" />
          <rect x="590" y="226" width="26" height="38" fill="#dc8b6f" />
          <rect x="612" y="240" width="30" height="24" fill="#b8644c" />
          <rect x="571" y="248" width="8" height="16" fill="#fbf5f2" />
          <rect x="598" y="236" width="6" height="7" fill="#fbf5f2" />
          <rect x="622" y="250" width="7" height="14" fill="#1e6b55" />
          <rect x="556" y="232" width="42" height="5" fill="#fbf5f2" opacity="0.8" />
        </g>
      </g>

      {/* Palmiers de l'oasis et rochers au premier plan */}
      <g {...anim(280)}>
        <Palmier x={720} y={300} s={1} fill="#1d2747" />
        <Palmier x={758} y={308} s={0.82} fill="#1d2747" />
        <Palmier x={1290} y={300} s={0.9} fill="#1d2747" />
        {ROCHERS_AVANT.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#gl-avant)" />
        ))}
        {ROCHERS_AVANT.slice(0, 6).map(([cx, cy, rx, ry], i) => (
          <ellipse key={`f${i}`} cx={cx - rx * 0.3} cy={cy - ry * 0.6} rx={rx * 0.38} ry={ry * 0.14} fill="#e8a890" opacity="0.22" />
        ))}
      </g>
    </svg>
  );
}
