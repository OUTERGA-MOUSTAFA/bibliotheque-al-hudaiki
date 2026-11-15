// Logo : un losange amazigh (motif des tapis et des portes de Tafraout) qui encadre un livre ouvert
export default function LibraryMark({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M24 2 L46 24 L24 46 L2 24 Z" fill="#1d2747" />
      <path d="M24 7 L41 24 L24 41 L7 24 Z" fill="none" stroke="#e5a833" strokeWidth="1.6" />
      {/* Livre ouvert */}
      <path d="M13 19 C17 17.5 21 18 24 20.5 L24 31 C21 28.6 17 28.2 13 29.6 Z" fill="#f1c4b5" />
      <path d="M35 19 C31 17.5 27 18 24 20.5 L24 31 C27 28.6 31 28.2 35 29.6 Z" fill="#fbf5f2" />
      <path d="M24 20.5 L24 31" stroke="#c87157" strokeWidth="1.2" />
      {/* Points safran aux sommets, comme sur les tissages */}
      <circle cx="24" cy="11" r="1.6" fill="#e5a833" />
      <circle cx="24" cy="37" r="1.6" fill="#e5a833" />
    </svg>
  );
}
