import { getTranslations } from 'next-intl/server';
import { BookOpen, Users, Baby, Globe, MapPin } from 'lucide-react';
import { Link } from '@/navigation';

// Coordonnées de la bibliothèque (README du projet)
const MAPS_URL = 'https://maps.google.com/?q=29.718881,-8.978229';

export async function generateMetadata() {
  const t = await getTranslations('history');
  return { title: t('title'), description: t('subtitle') };
}

export default async function HistoirePage() {
  const t = await getTranslations('history');

  const missions = [
    { icon: BookOpen, title: t('mission_1_title'), text: t('mission_1_text') },
    { icon: Baby, title: t('mission_2_title'), text: t('mission_2_text') },
    { icon: Users, title: t('mission_3_title'), text: t('mission_3_text') },
    { icon: Globe, title: t('mission_4_title'), text: t('mission_4_text') },
  ];

  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-night text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-gold-400 mb-4">{t('eyebrow')}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">{t('title')}</h1>
          <p className="text-stone-300 max-w-2xl mx-auto leading-relaxed">{t('subtitle')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">{t('our_story')}</h2>
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <p>{t('story_p1')}</p>
              <p>{t('story_p2')}</p>
            </div>
          </div>
          <aside className="md:col-span-2 bg-white rounded-3xl shadow-soft border border-stone-200 p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <MapPin className="text-brand-600" size={22} />
            </div>
            <h3 className="font-bold text-stone-900 mb-1">{t('visit_title')}</h3>
            <p className="text-sm text-stone-600 mb-4">{t('visit_text')}</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 hover:underline">
              {t('visit_map')}
            </a>
          </aside>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('mission_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {missions.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6">
                <Icon className="text-brand-600 mb-3" size={22} />
                <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t('cta_title')}</h2>
            <p className="text-brand-50">{t('cta_text')}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/catalogue" className="bg-white text-brand-700 font-semibold rounded-xl px-5 py-3 hover:bg-brand-50 transition">
              {t('cta_catalogue')}
            </Link>
            <Link href="/contact" className="border border-white/40 font-semibold rounded-xl px-5 py-3 hover:bg-white/10 transition">
              {t('cta_contact')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
