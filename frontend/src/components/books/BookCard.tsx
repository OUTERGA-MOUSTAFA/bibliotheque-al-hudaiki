import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Book as BookIcon, Eye, Heart, Star } from 'lucide-react';
import type { Book } from '@/types';

// Carte « livre » : couverture au format d'un vrai livre (2:3), dos ombré côté reliure,
// tranche de pages visible au survol, légère rotation 3D (désactivée si l'utilisateur réduit les animations).
// La reliure est à gauche en français et à droite en arabe (classes rtl:).
export default function BookCard({ book }: { book: Book }) {
  const t = useTranslations('book');
  const isAvailable = book.stock > 0;

  return (
    <div className="group block h-full">
      <div className="relative aspect-[2/3] perspective-distant">
        <div
          className="relative h-full transform-3d transition-transform duration-500 ease-out
            motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-y-12 motion-safe:rtl:group-hover:rotate-y-12
            motion-safe:group-focus-visible:-translate-y-2"
        >
          {/* Tranche des pages, glissée derrière la couverture côté ouverture */}
          <div
            aria-hidden
            className="absolute top-[2%] bottom-[2%] end-0 w-full rounded-e-md bg-[repeating-linear-gradient(90deg,#f5f1e8_0px,#f5f1e8_2px,#e7e0d0_3px)]
              shadow-md transition-transform duration-500 ease-out
              group-hover:translate-x-2 rtl:group-hover:-translate-x-2"
          />

          {/* Couverture */}
          <div
            className="absolute inset-0 rounded-s-sm rounded-e-lg overflow-hidden bg-sand
              shadow-[0_12px_28px_-12px_rgba(28,25,23,0.45)] group-hover:shadow-[0_24px_40px_-14px_rgba(28,25,23,0.55)]
              transition-shadow duration-500"
          >
            {book.image ? (
              <Image
                src={book.image}
                alt={book.titre}
                fill
                quality={85}
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-300 bg-stone-200">
                <BookIcon size={48} strokeWidth={1.5} />
              </div>
            )}

            {/* Dos du livre : ombre et pli de reliure */}
            <div aria-hidden className="absolute inset-y-0 start-0 w-[9%] bg-gradient-to-r rtl:bg-gradient-to-l from-black/35 via-white/15 to-transparent" />
            <div aria-hidden className="absolute inset-y-0 start-[3.5%] w-px bg-black/20" />
            {/* Reflet au survol */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-tr rtl:bg-gradient-to-tl from-transparent via-transparent to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Disponibilité (point + texte pour les lecteurs d'écran) */}
            <div className="absolute top-3 start-4" title={isAvailable ? t('available') : t('unavailable')}>
              <span className={`w-3 h-3 block rounded-full ${isAvailable ? 'bg-brand-500' : 'bg-coral-500'} ring-2 ring-white shadow-sm`} />
              <span className="sr-only">{isAvailable ? t('available') : t('unavailable')}</span>
            </div>

            {book.nb_favoris > 0 && (
              <div className="absolute top-3 end-3 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full px-2 py-0.5 text-xs">
                <Heart size={10} className="text-coral-500" fill="currentColor" />
                <span className="font-semibold text-stone-700 text-[10px]">{book.nb_favoris}</span>
              </div>
            )}

            {book.note_moyenne > 0 && (
              <div className="absolute bottom-3 start-4 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-2 py-1 text-xs">
                <Star size={11} className="text-gold-400" fill="currentColor" />
                <span className="font-bold text-white text-[11px]">{Number(book.note_moyenne || 0).toFixed(1)}</span>
              </div>
            )}

            {/* Invitation au clic, au survol ou au focus clavier */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 translate-y-2
                group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-300"
            >
              <span className="inline-flex items-center gap-1.5 bg-white/95 text-stone-900 text-xs font-semibold rounded-full px-3 py-1.5 shadow-md">
                <Eye size={13} /> {t('view')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-brand-700 transition text-sm sm:text-base leading-snug">
          {book.titre}
        </h3>
        {book.categorie && <p className="text-xs text-stone-500 line-clamp-1">{book.categorie.nom}</p>}
      </div>
    </div>
  );
}
