import Link from 'next/link';
import Image from 'next/image';
import { Book as BookIcon, Heart } from 'lucide-react';
import type { Book } from '@/types';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shadow-sm group-hover:shadow-lg transition">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.titre}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
            sizes="(max-width: 768px) 50vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <BookIcon size={48} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              book.stock > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {book.stock > 0 ? 'Disponible' : 'Emprunté'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 text-xs">
          <Heart size={12} className="text-rose-500" fill="currentColor" />
          <span>{book.nb_favoris}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-stone-900 line-clamp-2 group-hover:text-emerald-700 transition">
          {book.titre}
        </h3>
        {book.categorie && (
          <p className="text-xs text-stone-500">{book.categorie.nom}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>⭐ {book.note_moyenne.toFixed(1)}</span>
          <span>·</span>
          <span>{book.nb_emprunts} emprunts</span>
        </div>
      </div>
    </Link>
  );
}