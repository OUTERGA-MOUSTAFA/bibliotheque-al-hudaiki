// src/app/[locale]/page.tsx
import { fetchBooks, fetchCategories, fetchHero, fetchSponsors } from '@/lib/api';
import Hero from '@/components/home/Hero';
import PopularCarousel from '@/components/home/PopularCarousel';
import Categories from '@/components/home/Categories';
import Sponsors from '@/components/home/Sponsors';
import BookGrid from '@/components/books/BookGrid';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  // La langue est transmise à l'API : noms de catégories traduits
  const [hero, popular, recent, categories, sponsors] = await Promise.all([
    fetchHero(locale),
    fetchBooks({ tri: 'populaire', per_page: 10 }, locale).catch(() => ({ data: [] })),
    fetchBooks({ tri: 'recent', per_page: 8 }, locale).catch(() => ({ data: [] })),
    fetchCategories(locale),
    fetchSponsors(locale),
  ]);

  return (
    <>
       <Hero data={hero} />
      <PopularCarousel books={popular.data || []} />
      <Categories categories={categories || []} />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">{t('new_books')}</h2>
        <BookGrid books={recent.data || []} />
      </section>
      <Sponsors sponsors={sponsors || []} />
    </>
  );
}