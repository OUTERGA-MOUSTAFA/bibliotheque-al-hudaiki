import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { BookOpen, Sparkles, History, FlaskConical, Heart, Users, Baby, Palette } from 'lucide-react';
import type { Category } from '@/types';

// Icon + color mapping
const CATEGORY_STYLES = [
  { icon: BookOpen,       color: 'emerald', bg: 'from-brand-50 to-brand-100',     text: 'text-brand-700',   ring: 'ring-brand-200' },
  { icon: Baby,           color: 'gold',    bg: 'from-gold-50 to-gold-100',       text: 'text-gold-700',    ring: 'ring-gold-200' },
  { icon: History,        color: 'coral',   bg: 'from-coral-50 to-coral-100',     text: 'text-coral-700',   ring: 'ring-coral-200' },
  { icon: FlaskConical,   color: 'sky',     bg: 'from-sky-50 to-sky-100',         text: 'text-sky-700',     ring: 'ring-sky-200' },
  { icon: Heart,          color: 'rose',    bg: 'from-rose-50 to-rose-100',       text: 'text-rose-700',    ring: 'ring-rose-200' },
  { icon: Users,          color: 'violet',  bg: 'from-violet-50 to-violet-100',   text: 'text-violet-700',  ring: 'ring-violet-200' },
  { icon: Sparkles,       color: 'gold',    bg: 'from-gold-50 to-gold-100',       text: 'text-gold-700',    ring: 'ring-gold-200' },
  { icon: Palette,        color: 'emerald', bg: 'from-brand-50 to-brand-100',     text: 'text-brand-700',   ring: 'ring-brand-200' },
];

export default function Categories({ categories }: { categories: Category[] }) {
  const t = useTranslations('home');
  if (!categories?.length) return null;

  return (
    <section className="py-20 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="divider-gold mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
            📂 {t('categories')}
          </h2>
          <p className="text-stone-600">اكتشف مجموعتنا حسب اهتمامك</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat, index) => {
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
            const Icon = style.icon;

            return (
              <Link
                key={cat.id}
                href={`/catalogue?categorie=${cat.id}`}
                className={`
                  group relative overflow-hidden rounded-2xl p-6
                  bg-gradient-to-br ${style.bg}
                  ring-1 ${style.ring}
                  hover:shadow-soft-lg hover:-translate-y-1
                  transition-all duration-300
                `}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={24} className={style.text} strokeWidth={2} />
                </div>

                {/* Text */}
                <h3 className={`font-bold text-lg ${style.text} mb-1`}>{cat.nom}</h3>
                {cat.books_count !== undefined && (
                  <p className="text-xs text-stone-600 font-medium">{cat.books_count} كتاب</p>
                )}

                {/* Decorative element */}
                <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${style.text} opacity-5 group-hover:opacity-10 transition`} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}