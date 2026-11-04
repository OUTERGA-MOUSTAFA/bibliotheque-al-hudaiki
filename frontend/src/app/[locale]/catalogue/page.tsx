import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookX } from 'lucide-react';
import { fetchBooks, fetchCategories } from '@/lib/api';
import { Link } from '@/navigation';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';
import type { Book } from '@/types';

type SearchParams = {
  q?: string;
  categorie?: string;
  langue?: string;
  disponible?: string;
  tri?: string;
  page?: string;
};

const FILTER_KEYS = ['q', 'categorie', 'langue', 'disponible', 'tri'] as const;

export default async function CataloguePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');
  const query = await searchParams;
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);

  const [books, categories] = await Promise.all([
    fetchBooks({ ...Object.fromEntries(FILTER_KEYS.map((k) => [k, query[k]])), page, per_page: 12 })
      .catch(() => ({ data: [], total: 0, last_page: 1 })),
    fetchCategories(),
  ]);

  const list: Book[] = books.data ?? [];
  const total: number = books.total ?? 0;
  const lastPage: number = books.last_page ?? 1;

  // Lien vers une autre page en gardant les filtres en cours
  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    FILTER_KEYS.forEach((k) => { if (query[k]) qs.set(k, query[k] as string); });
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/catalogue?${s}` : '/catalogue';
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">{t('title')}</h1>
          <p className="text-stone-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookFilters categories={categories} />
          </aside>

          <div>
            <p className="text-sm text-stone-600 mb-6">{t('results', { count: total })}</p>

            {list.length > 0 ? (
              <>
                <BookGrid books={list} />

                {lastPage > 1 && (
                  <nav className="flex flex-wrap justify-center items-center gap-2 mt-12" aria-label={t('pagination')}>
                    {page > 1 && (
                      <Link href={pageHref(page - 1)} className="px-4 h-10 rounded-xl flex items-center text-sm font-semibold bg-white border border-stone-200 text-stone-700 hover:border-brand-500">
                        {t('previous')}
                      </Link>
                    )}
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={pageHref(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition ${p === page
                          ? 'bg-brand-600 text-white shadow-brand-glow'
                          : 'bg-white border border-stone-200 text-stone-700 hover:border-brand-500 hover:text-brand-600'}`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < lastPage && (
                      <Link href={pageHref(page + 1)} className="px-4 h-10 rounded-xl flex items-center text-sm font-semibold bg-white border border-stone-200 text-stone-700 hover:border-brand-500">
                        {t('next')}
                      </Link>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                <div className="w-20 h-20 rounded-2xl bg-sand flex items-center justify-center mx-auto mb-4">
                  <BookX className="text-stone-400" size={32} />
                </div>
                <h2 className="text-lg font-bold text-stone-900 mb-2">{t('no_results')}</h2>
                <p className="text-sm text-stone-500">{t('no_results_hint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
