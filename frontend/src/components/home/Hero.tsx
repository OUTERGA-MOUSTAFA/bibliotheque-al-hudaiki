'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="section-hero">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-[120px] opacity-[0.03] rotate-12 select-none pointer-events-none">📚</div>
      <div className="absolute bottom-20 left-10 text-[100px] opacity-[0.03] -rotate-12 select-none pointer-events-none">📖</div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>مكتبة الهدائكي العامة — تفراوت</span>
          </div>

          {/* Main title */}
          <h1
            className={`
              text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white
              ${isArabic ? 'font-arabic-tech' : ''}
            `}
          >
            {t('hero_title')}
            <span className="text-gold-400">.</span>
          </h1>

          {/* Decorative line */}
          <div className="divider-gold mb-6" />

          <p className="text-lg sm:text-xl text-stone-300 mb-10 max-w-2xl leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/catalogue">
              <Button
                size="lg"
                className="bg-brand-600 hover:bg-brand-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-brand-glow hover:shadow-lg transition-all"
              >
                {t('hero_cta')} <ArrowIcon className="ms-2" size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 h-12 text-base backdrop-blur-sm"
              >
                {t('hero_cta_secondary')}
              </Button>
            </Link>
          </div>

          {/* Stats mini */}
          <div className="flex flex-wrap items-center gap-8 mt-14 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold text-gold-400">+500</div>
              <div className="text-sm text-stone-400">كتاب</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">+200</div>
              <div className="text-sm text-stone-400">قارئ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">24/7</div>
              <div className="text-sm text-stone-400">وصول للفهرس</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom curve glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
    </section>
  );
}