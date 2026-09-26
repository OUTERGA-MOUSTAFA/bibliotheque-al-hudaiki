import { Link } from '@/navigation';
import Image from 'next/image';
import { Book as BookIcon, Heart, Star } from 'lucide-react';
import type { Book } from '@/types';

export default function BookCard({ book }: { book: Book }) {
  const isAvailable = book.stock > 0;

  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand shadow-soft group-hover:shadow-soft-lg transition-all duration-300 group-hover:-translate-y-1">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.titre}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
            sizes="(max-width: 768px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300 bg-gradient-to-br from-sand to-stone-200">
            <BookIcon size={56} strokeWidth={1.5} />
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`
              text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide
              ${isAvailable
                ? 'bg-brand-500/95 text-white shadow-sm'
                : 'bg-coral-500/95 text-white shadow-sm'
              }
            `}
          >
            {isAvailable ? '● متوفر' : '● مُعار'}
          </span>
        </div>

        {/* Favorite count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 text-xs shadow-sm">
          <Heart size={12} className="text-coral-500" fill="currentColor" />
          <span className="font-bold text-stone-700">{book.nb_favoris}</span>
        </div>

        {/* Rating badge */}
        {book.note_moyenne > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 text-xs shadow-sm">
            <Star size={12} className="text-gold-500" fill="currentColor" />
            <span className="font-bold text-stone-700">{book.note_moyenne.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-brand-700 transition text-sm leading-snug">
          {book.titre}
        </h3>
        {book.categorie && (
          <p className="text-xs text-stone-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            {book.categorie.nom}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>{book.nb_emprunts} استعارة</span>
        </div>
      </div>
    </Link>
  );
}