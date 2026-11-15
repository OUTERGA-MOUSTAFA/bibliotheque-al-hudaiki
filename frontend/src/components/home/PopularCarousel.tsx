'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import BookCard from '@/components/books/BookCard';
import PublicBookModal from '@/components/books/PublicBookModal';
import type { Book } from '@/types';

export default function PopularCarousel({ books }: { books: Book[] }) {
  const t = useTranslations('home');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [emblaRef] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      direction: isArabic ? 'rtl' : 'ltr',
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  if (!books.length) return null;

  return (
    <section className="py-20 bg-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <h2 className="text-3xl sm:text-4xl text-night mb-10">{t('popular')}</h2>

        {/* Les livres posés sur une étagère en bois de palmier */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6">
              {books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_23%] min-w-0 text-start pt-2 pb-6 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  onClick={() => setSelectedBook(book)}
                >
                  <BookCard book={book} />
                </button>
              ))}
            </div>
          </div>
          <div className="h-3 rounded-sm bg-gradient-to-b from-granite-600 to-granite-900 shadow-[0_14px_24px_-12px_rgba(86,48,38,0.6)]" aria-hidden />
        </div>
      </div>

      <PublicBookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onRefresh={() => window.location.reload()}
      />
    </section>
  );
}