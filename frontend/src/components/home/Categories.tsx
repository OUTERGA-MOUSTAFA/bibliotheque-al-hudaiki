import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Image from 'next/image';
import type { Category } from '@/types';

export default function Categories({ categories }: { categories: Category[] }) {
  const t = useTranslations('home');
  if (!categories?.length) return null;

  return (
    <section className="py-16 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-stone-900 mb-8">📂 {t('categories')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogue?categorie=${cat.id}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            >
              {cat.visuel && (
                <Image
                  src={cat.visuel}
                  alt={cat.nom}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                  sizes="200px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm line-clamp-2">{cat.nom}</p>
                {cat.books_count !== undefined && (
                  <p className="text-white/80 text-xs mt-0.5">{cat.books_count} livres</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}