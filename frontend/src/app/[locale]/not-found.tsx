import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';

// 404 dans la langue de la page (notFound() appelé depuis une page ou un layout localisé)
export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl font-extrabold text-brand-600 mb-4">404</div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">{t('not_found_title')}</h1>
      <p className="text-stone-600 mb-8 max-w-md">{t('not_found_text')}</p>
      <Link href="/" className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold">
        {t('back_home')}
      </Link>
    </div>
  );
}
