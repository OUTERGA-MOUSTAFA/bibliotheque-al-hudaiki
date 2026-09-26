import { Link } from '@/navigation';
import Image from 'next/image';
import { Book as BookIcon, Heart, Star } from 'lucide-react';
import type { Book } from '@/types';

export default function BookCard({ book }: { book: Book }) {
  const isAvailable = book.stock > 0;

  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-sand shadow-soft group-hover:shadow-soft-lg transition-all duration-300">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.titre}
            fill
            className="object-cover group-hover:scale-[1.03] transition duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <BookIcon size={48} strokeWidth={1.5} />
          </div>
        )}

        {/* Status dot — machi badge 3ari9 */}
        <div className="absolute top-3 left-3">
          <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-brand-500' : 'bg-coral-500'} ring-2 ring-white shadow-sm`} />
        </div>

        {/* Favorites */}
        {book.nb_favoris > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur rounded-full px-2 py-0.5 text-xs">
            <Heart size={10} className="text-coral-500" fill="currentColor" />
            <span className="font-semibold text-stone-700 text-[10px]">{book.nb_favoris}</span>
          </div>
        )}

        {/* Rating bottom */}
        {book.note_moyenne > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-2 py-1 text-xs">
            <Star size={11} className="text-gold-400" fill="currentColor" />
            <span className="font-bold text-white text-[11px]">{book.note_moyenne.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-brand-700 transition text-sm leading-snug">
          {book.titre}
        </h3>
        {book.categorie && (
          <p className="text-xs text-stone-500">{book.categorie.nom}</p>
        )}
      </div>
    </Link>
  );
}