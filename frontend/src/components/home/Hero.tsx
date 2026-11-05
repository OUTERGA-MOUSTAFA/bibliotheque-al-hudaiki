'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Users, Clock } from 'lucide-react';
import type { HeroData, HeroSlide } from '@/types';
import HeroCarousel from './hero/HeroCarousel';
import HeroSplit from './hero/HeroSplit';
import HeroLink, { imageNonOptimisee } from './hero/HeroLink';

// Bannière d'accueil : le modèle et les diapositives sont choisis par l'admin (Administration → Page d'accueil).
// Sans diapositive, on garde la bannière d'origine (modèle « classique »).
export default function Hero({ data }: { data?: HeroData }) {
  const reglages = data?.reglages;
  const slides = data?.slides ?? [];

  if (slides.length && reglages?.modele === 'carrousel') {
    return <HeroCarousel slides={slides} secondes={reglages.defilement} />;
  }
  if (slides.length && reglages?.modele === 'image') {
    return <HeroSplit slides={slides} secondes={reglages.defilement} />;
  }
  return <HeroClassique slide={slides[0]} afficherStats={reglages?.afficher_stats ?? true} />;
}

function HeroClassique({ slide, afficherStats }: { slide?: HeroSlide; afficherStats: boolean }) {
  const t = useTranslations('home');
  const isArabic = useLocale() === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const stats = [
    { value: '+500', label: t('stat_books'), icon: BookOpen },
    { value: '+200', label: t('stat_readers'), icon: Users },
    { value: '24/7', label: t('stat_access'), icon: Clock },
  ];

  // Textes de la 1re diapositive s'il y en a une, sinon textes par défaut du site
  const badge = slide?.badge || t('badge');
  const titre = slide?.titre || t('hero_title');
  const sousTitre = slide?.sous_titre || t('hero_subtitle');

  return (
    <section className="relative bg-night overflow-hidden">
      {slide?.image && (
        <>
          <Image src={slide.image} alt="" fill priority sizes="100vw" unoptimized={imageNonOptimisee(slide.image)} className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/60 to-night" />
        </>
      )}

      <div className="absolute inset-0" aria-hidden>
        <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-gold-500/15 rounded-full blur-[120px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} />
            <span>{badge}</span>
          </div>

          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-6 text-white ${isArabic ? 'font-arabic-tech' : ''}`}>
            {titre}
            <span className="text-gold-400">.</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">{sousTitre}</p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {slide?.bouton && slide.lien ? (
              <HeroLink href={slide.lien} className="inline-flex items-center bg-brand-600 hover:bg-brand-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-brand-glow transition">
                {slide.bouton} <ArrowIcon className="ms-2" size={18} />
              </HeroLink>
            ) : (
              <Link href="/catalogue" className="inline-flex items-center bg-brand-600 hover:bg-brand-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-brand-glow transition">
                {t('hero_cta')} <ArrowIcon className="ms-2" size={18} />
              </Link>
            )}
            <Link href="/login" className="inline-flex items-center border border-white/20 text-white hover:bg-white/5 rounded-full px-8 h-12 text-base backdrop-blur-sm transition">
              {t('hero_cta_secondary')}
            </Link>
          </div>

          {afficherStats && (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition">
                    <Icon className="mx-auto text-gold-400 mb-2" size={22} />
                    <div className="text-2xl sm:text-3xl font-bold text-white leading-none">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-stone-400 mt-2">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
