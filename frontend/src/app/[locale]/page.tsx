import { fetchBooks, fetchCategories, fetchSponsors } from '@/lib/api';
import Hero from '@/components/home/Hero';
import PopularCarousel from '@/components/home/PopularCarousel';
import Categories from '@/components/home/Categories';
import Sponsors from '@/components/home/Sponsors';
import BookGrid from '@/components/books/BookGrid';

export default async function HomePage() {
  const [popular, recent, categories, sponsors] = await Promise.all([
    fetchBooks({ tri: 'populaire', per_page: 10 }).catch(() => ({ data: [] })),
    fetchBooks({ tri: 'recent', per_page: 8 }).catch(() => ({ data: [] })),
    fetchCategories().catch(() => []),
    fetchSponsors().catch(() => []),
  ]);

  return (
    <>
      <Hero />
      <PopularCarousel books={popular.data || []} />
      <Categories categories={categories || []} />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Nouveautés</h2>
        <BookGrid books={recent.data || []} />
      </section>
      <Sponsors sponsors={sponsors || []} />
    </>
  );
}