import { getTranslations } from 'next-intl/server';
import { ShieldCheck } from 'lucide-react';
import { Link } from '@/navigation';

// Politique de confidentialité — Loi n° 09-08 relative à la protection des personnes physiques
// à l'égard du traitement des données à caractère personnel.
// ⚠️ Les éléments entre crochets (n° de déclaration CNDP, responsable) doivent être complétés
// par la bibliothèque après sa déclaration auprès de la CNDP.

const SECTIONS = ['controller', 'data', 'purposes', 'legal_basis', 'recipients', 'retention', 'security', 'minors', 'rights', 'cndp'] as const;

export async function generateMetadata() {
  const t = await getTranslations('privacy');
  return { title: t('title') };
}

export default async function ConfidentialitePage() {
  const t = await getTranslations('privacy');

  return (
    <div className="bg-cream min-h-screen py-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-brand-600" />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-3">{t('title')}</h1>
          <p className="text-stone-600 leading-relaxed">{t('intro')}</p>
          <p className="text-xs text-stone-400 mt-3">{t('updated')}</p>
        </header>

        <div className="bg-white rounded-3xl shadow-soft border border-stone-200 p-6 sm:p-10 space-y-8">
          {SECTIONS.map((key, i) => (
            <section key={key}>
              <h2 className="text-lg font-bold text-stone-900 mb-2">
                {i + 1}. {t(`${key}_title`)}
              </h2>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">{t(`${key}_text`)}</p>
            </section>
          ))}

          <section className="bg-sand rounded-2xl p-5">
            <h2 className="font-bold text-stone-900 mb-2">{t('exercise_title')}</h2>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">{t('exercise_text')}</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/compte/parametres" className="text-brand-600 hover:underline">{t('exercise_settings')}</Link>
              <Link href="/contact" className="text-brand-600 hover:underline">{t('exercise_contact')}</Link>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
