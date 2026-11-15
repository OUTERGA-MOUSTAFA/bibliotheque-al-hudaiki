'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import GraniteLandscape from '@/components/tafraout/GraniteLandscape';
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
  const locale = useLocale();
  const ArrowIcon = locale === 'ar' ? ArrowLeft : ArrowRight;

  const stats = [
    { value: '+500', label: t('stat_books') },
    { value: '+200', label: t('stat_readers') },
    { value: '24/7', label: t('stat_access') },
  ];

  // Textes de la 1re diapositive s'il y en a une, sinon textes par défaut du site
  const badge = slide?.badge || t('badge');
  const titre = slide?.titre || t('hero_title');
  const sousTitre = slide?.sous_titre || t('hero_subtitle');

  return (
    // Ciel du soir sur la vallée des Ameln : nuit indigo en haut, granit rosé à l'horizon
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#1d2747_0%,#28325e_40%,#6b5577_72%,#d99a86_100%)]">
      {slide?.image && (
        <>
          <Image src={slide.image} alt="" fill priority sizes="100vw" unoptimized={imageNonOptimisee(slide.image)} className="object-cover opacity-25 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/50 to-transparent" />
        </>
      )}

      {/* Soleil safran qui se couche derrière les rochers */}
      <div
        className="hidden sm:block absolute end-[12%] sm:bottom-[190px] lg:bottom-[230px] sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gold-400 shadow-[0_0_120px_40px_rgba(229,168,51,0.35)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-[230px] sm:pb-[290px] lg:pb-[330px]">
        <div className="max-w-2xl">
          <p className="text-granite-300 text-sm sm:text-base font-medium mb-5">{badge}</p>

          <h1 className="text-[2.6rem] leading-[1.15] sm:text-6xl lg:text-7xl font-semibold text-cream mb-6">
            {titre}
          </h1>

          <p className="text-lg sm:text-xl text-indigo-night-50/80 mb-10 max-w-xl">{sousTitre}</p>

          {slide?.bouton && slide.lien ? (
            <HeroLink href={slide.lien} className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-night rounded-full px-8 h-13 text-base font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400">
              {slide.bouton} <ArrowIcon size={18} />
            </HeroLink>
          ) : (
            // Formulaire GET classique : la recherche marche même avant le chargement du JavaScript
            <form action={`/${locale}/catalogue`} method="get" role="search" className="max-w-xl">
              <label htmlFor="hero-search" className="sr-only">{t('search_label')}</label>
              <div className="flex items-center gap-2 rounded-full bg-cream p-1.5 shadow-[0_20px_50px_-20px_rgba(8,12,30,0.7)] focus-within:ring-4 focus-within:ring-gold-400/60">
                <Search className="ms-4 shrink-0 text-indigo-night-500" size={20} aria-hidden />
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder={t('search_placeholder')}
                  className="min-w-0 flex-1 bg-transparent py-3 text-base text-night placeholder:text-indigo-night-500/80 outline-none"
                />
                <button type="submit" className="shrink-0 rounded-full bg-brand-600 hover:bg-brand-700 text-cream px-5 sm:px-7 h-12 text-base font-semibold transition active:scale-95">
                  {t('search_button')}
                </button>
              </div>
              <Link href="/catalogue" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cream/80 hover:text-gold-400 underline-offset-4 hover:underline">
                {t('hero_cta')} <ArrowIcon size={15} />
              </Link>
            </form>
          )}

          {afficherStats && (
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl text-gold-400" dir="ltr">{stat.value}</dd>
                  <dd className="text-sm text-cream/75">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <GraniteLandscape className="absolute inset-x-0 bottom-0 w-full h-[220px] sm:h-[280px] lg:h-[330px]" />
    </section>
  );
}
