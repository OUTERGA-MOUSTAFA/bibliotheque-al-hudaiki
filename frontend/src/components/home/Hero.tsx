'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Users, Clock } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const stats = [
    { value: '+500', label: 'كتاب',        icon: BookOpen },
    { value: '+200', label: 'قارئ',         icon: Users },
    { value: '24/7', label: 'وصول رقمي',   icon: Clock },
  ];

  return (
    <section className="relative bg-night overflow-hidden">
      {/* Gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>مكتبة الهدائكي العامة — تفراوت</span>
          </div>

          {/* Title */}
          <h1
            className={`
              text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-6 text-white
              ${isArabic ? 'font-arabic-tech' : ''}
            `}
          >
            {t('hero_title')}
            <span className="text-gold-400">.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/catalogue">
              <Button
                size="lg"
                className="bg-brand-600 hover:bg-brand-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-brand-glow"
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

          {/* Stats — FIXED */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition"
                >
                  <Icon className="mx-auto text-gold-400 mb-2" size={22} />
                  <div className="text-2xl sm:text-3xl font-bold text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-stone-400 mt-2">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}