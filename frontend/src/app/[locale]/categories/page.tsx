import { getTranslations } from 'next-intl/server';
import { fetchCategories } from '@/lib/api';
import { Link } from '@/navigation';
import { FolderOpen, BookOpen } from 'lucide-react';
import type { Category } from '@/types';
export default async function CategoriesPage() {
  const t = await getTranslations('home'); // Wla 'catalog'
  const categories = await fetchCategories().catch(() => []);

  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <div className="divider-gold mb-4" />
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            📂 {t('categories')}
          </h1>
          <p className="text-stone-600">Explorez notre fonds documentaire par thématique.</p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/catalogue?categorie=${cat.id}`}
                className="group bg-white rounded-2xl p-6 shadow-soft border border-stone-200 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition">
                  <FolderOpen className="text-brand-600" size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-brand-700 transition">
                  {cat.nom}
                </h3>
                
                <p className="text-sm text-stone-500 mb-4 line-clamp-2">
                  {cat.description || 'Découvrez notre sélection.'}
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-brand-600">
                  <BookOpen size={14} />
                  <span>{cat.books_count || 0} livres</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <FolderOpen className="mx-auto text-stone-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Aucune catégorie trouvée</h2>
          </div>
        )}

      </div>
    </div>
  );
}