'use client';

import { useTranslations, useLocale } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import BookCard from '@/components/books/BookCard';
import { TrendingUp } from 'lucide-react';
import type { Book } from '@/types';

export default function PopularCarousel({ books }: { books: Book[] }) {
  const t = useTranslations('home');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [emblaRef] = useEmblaCarousel(
    { align: 'start', loop: true, direction: isArabic ? 'rtl' : 'ltr' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  if (!books.length) return null;

  return (
    <section className="py-20 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center shadow-gold-glow">
            <TrendingUp className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
              {t('popular')}
            </h2>
            <div className="mt-1 h-1 w-16 bg-gold-500 rounded-full" />
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {books.map((book) => (
              <div key={book.id} className="flex-[0_0_240px] min-w-0">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}