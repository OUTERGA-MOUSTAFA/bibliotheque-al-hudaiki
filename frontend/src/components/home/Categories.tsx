import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { Category } from '@/types';

// Les portes peintes des maisons de Tafraout : indigo, vert palmeraie, safran, granit.
// Chaque catégorie est une porte en arc, avec ses clous de métal et un losange au-dessus du linteau.
const PORTES = [
  { bg: 'bg-night', clou: 'rgba(229,168,51,0.55)', texte: 'text-cream', sous: 'text-cream/70' },
  { bg: 'bg-brand-600', clou: 'rgba(251,245,242,0.45)', texte: 'text-cream', sous: 'text-cream/75' },
  { bg: 'bg-gold-500', clou: 'rgba(29,39,71,0.35)', texte: 'text-night', sous: 'text-night/70' },
  { bg: 'bg-granite-600', clou: 'rgba(251,245,242,0.4)', texte: 'text-cream', sous: 'text-cream/75' },
];

export default function Categories({ categories }: { categories: Category[] }) {
  const t = useTranslations('home');
  if (!categories?.length) return null;

  return (
    <section className="py-20 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl text-night mb-3">{t('categories')}</h2>
          <p className="text-indigo-night-700/80">{t('categories_subtitle')}</p>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-8">
          {categories.slice(0, 8).map((cat, index) => {
            const p = PORTES[index % PORTES.length];
            return (
              <li key={cat.id}>
                <Link
                  href={`/catalogue?categorie=${cat.id}`}
                  className="group block rounded-t-[999px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                >
                  {/* Encadrement blanchi à la chaux autour de la porte */}
                  <div className="rounded-t-[999px] bg-cream p-2 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-soft-lg">
                    <div
                      className={`relative aspect-[5/6] rounded-t-[999px] ${p.bg} overflow-hidden flex flex-col justify-end p-4 sm:p-5`}
                      style={{
                        backgroundImage: `radial-gradient(circle, ${p.clou} 1.6px, transparent 2px)`,
                        backgroundSize: '22px 22px',
                        backgroundPosition: '11px 11px',
                      }}
                    >
                      {/* Losange au sommet de l'arc */}
                      <svg viewBox="0 0 24 24" className="absolute top-[14%] start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-6 h-6" aria-hidden>
                        <path d="M12 1 L23 12 L12 23 L1 12 Z" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.texte} />
                        <path d="M12 7 L17 12 L12 17 L7 12 Z" fill="currentColor" className={p.texte} />
                      </svg>
                      <h3 className={`relative text-lg sm:text-xl leading-snug ${p.texte}`}>{cat.nom}</h3>
                      {cat.books_count !== undefined && (
                        <p className={`relative mt-1 text-sm ${p.sous}`}>{t('books_count', { count: cat.books_count })}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
