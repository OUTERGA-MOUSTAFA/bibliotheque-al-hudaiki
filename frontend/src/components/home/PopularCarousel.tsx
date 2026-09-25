'use client';

import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import BookCard from '@/components/books/BookCard';
import type { Book } from '@/types';

export default function PopularCarousel({ books }: { books: Book[] }) {
  const t = useTranslations('home');
  const [emblaRef] = useEmblaCarousel(
    { align: 'start', loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  if (!books.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-bold text-stone-900">🔥 {t('popular')}</h2>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {books.map((book) => (
              <div key={book.id} className="flex-[0_0_280px] min-w-0">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}