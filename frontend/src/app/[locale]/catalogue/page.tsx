// src/app/[locale]/catalogue/page.tsx
import { fetchBooks, fetchCategories } from '@/lib/api';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Catalogue</h1>
      <p className="text-stone-600 mb-8">
        {books.total || 0} livres trouvés
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Filtres */}
        <aside>
          <BookFilters categories={categories} />
        </aside>

        {/* Résultats */}
        <div>
          {books.data?.length ? (
            <>
              <BookGrid books={books.data} />

              {/* Pagination */}
              {books.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: books.last_page }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?page=${p}`}
                      className={`px-4 py-2 rounded-lg border ${
                        p === parseInt(params.page || '1')
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-stone-200 hover:border-emerald-600'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-stone-500">
              Aucun livre trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}