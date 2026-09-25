'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-stone-950 text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-stone-950 to-black" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative emoji */}
      <div className="absolute top-20 right-10 text-8xl opacity-10 rotate-12 select-none">📚</div>
      <div className="absolute bottom-20 left-10 text-7xl opacity-10 -rotate-12 select-none">📖</div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className={`max-w-3xl ${isArabic ? 'mr-auto' : ''}`}>
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <BookOpen size={14} />
            <span>مكتبة الهدائكي العامة — تفراوت</span>
          </div>

          {/* Main title — style كيما ف ليماج */}
          <h1
            className={`
              text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6
              ${isArabic ? 'font-arabic-tech' : ''}
            `}
          >
            {t('hero_title')}
            <span className="text-emerald-400">.</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-400 mb-10 max-w-2xl leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/catalogue">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-8 h-12 text-base font-semibold"
              >
                {t('hero_cta')} <ArrowIcon className="ms-2" size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-stone-700 text-white hover:bg-white/5 rounded-full px-8 h-12 text-base"
              >
                {t('hero_cta_secondary')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
    </section>
  );
}