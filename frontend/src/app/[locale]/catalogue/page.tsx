import { getTranslations } from 'next-intl/server';
import { fetchBooks, fetchCategories } from '@/lib/api';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';
import { BookX } from 'lucide-react';

interface SearchParams {
  q?: string;
  categorie?: string;
  langue?: string;
  disponible?: string;
  tri?: string;
  page?: string;
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations('catalog');
  const params = await searchParams;

  const [books, categories] = await Promise.all([
    fetchBooks({
      q: params.q,
      categorie: params.categorie,
      langue: params.langue,
      disponible: params.disponible,
      tri: params.tri || 'recent',
      page: params.page || '1',
      per_page: 12,
    }).catch(() => ({ data: [], total: 0, last_page: 1 })),
    fetchCategories().catch(() => []),
  ]);

  const total = books.total || 0;
  const hasResults = books.data?.length > 0;

  return (
    <div className="bg-cream min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-stone-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar filtres */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookFilters categories={categories} />
          </aside>

          {/* Results */}
          <div>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-600">
                {total} {total === 1 ? 'كتاب' : 'كتاب'}
              </p>
            </div>

            {hasResults ? (
              <>
                <BookGrid books={books.data} />

                {/* Pagination */}
                {books.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {Array.from({ length: books.last_page }, (_, i) => i + 1).map((p) => {
                      const isActive = p === parseInt(params.page || '1');
                      return (
                        <a
                          key={p}
                          href={`?page=${p}`}
                          className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            text-sm font-semibold transition
                            ${isActive
                              ? 'bg-brand-600 text-white shadow-brand-glow'
                              : 'bg-white border border-stone-200 text-stone-700 hover:border-brand-500 hover:text-brand-600'
                            }
                          `}
                        >
                          {p}
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                <div className="w-20 h-20 rounded-2xl bg-sand flex items-center justify-center mx-auto mb-4">
                  <BookX className="text-stone-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  {t('no_results')}
                </h3>
                <p className="text-sm text-stone-500">
                  {t('no_results_hint')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}