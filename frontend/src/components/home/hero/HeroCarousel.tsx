'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { HeroSlide } from '@/types';
import HeroLink, { imageNonOptimisee } from './HeroLink';
import { useAutoplay } from './useAutoplay';

// Modèle « carrousel » : grande image arrondie, texte sur un dégradé sombre,
// onglets en bas avec barre de progression, pause et flèches.
export default function HeroCarousel({ slides, secondes }: { slides: HeroSlide[]; secondes: number }) {
  const t = useTranslations('home');
  const isRtl = useLocale() === 'ar';
  const { index, aller, suivant, precedent, enPause, actif, basculerPause, survolProps } = useAutoplay(slides.length, secondes);
  const Fleche = isRtl ? ArrowLeft : ArrowRight;
  const plusieurs = slides.length > 1;

  return (
    <section className="bg-cream pt-6 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative h-[560px] sm:h-[600px] lg:h-[640px] rounded-[2rem] overflow-hidden bg-night shadow-soft-lg"
          role="region"
          aria-roledescription="carousel"
          aria-label={t('hero_label')}
          {...survolProps}
        >
          {slides.map((s, i) => {
            const visible = i === index;
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={t('hero_slide_of', { current: i + 1, total: slides.length })}
                aria-hidden={!visible}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  unoptimized={imageNonOptimisee(s.image)}
                  className={`object-cover transition-transform duration-[7000ms] ease-out ${visible ? 'scale-105' : 'scale-100'}`}
                />
                {/* Dégradé côté texte (à gauche en français, à droite en arabe) pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black/80 via-black/45 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="relative h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 pb-28">
                  <div className="max-w-xl">
                    {s.badge && <p className="text-sm sm:text-base font-semibold text-white/90 mb-3">{s.badge}</p>}
                    {s.titre && (
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                        {s.titre}
                      </h2>
                    )}
                    {s.sous_titre && (
                      <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-lg">{s.sous_titre}</p>
                    )}
                    {s.bouton && s.lien && (
                      <HeroLink
                        href={s.lien}
                        className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold rounded-xl px-6 h-12 hover:bg-cream transition shadow-lg"
                      >
                        {s.bouton} <Fleche size={18} />
                      </HeroLink>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {plusieurs && (
            <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 lg:px-16 pb-6 sm:pb-8 flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={basculerPause}
                aria-label={enPause ? t('hero_play') : t('hero_pause')}
                className="shrink-0 w-11 h-11 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/10 transition"
              >
                {enPause ? <Play size={16} /> : <Pause size={16} />}
              </button>

              {/* Onglets : titre de chaque diapositive + barre de progression */}
              <div className="flex-1 hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => aller(i)}
                    aria-current={i === index}
                    className={`text-start text-sm font-semibold pb-2 truncate transition ${i === index ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
                  >
                    {s.titre || t('hero_slide_of', { current: i + 1, total: slides.length })}
                    <span className="mt-2 block h-0.5 w-full bg-white/30 overflow-hidden">
                      {i === index && (
                        <span
                          key={`${index}-${actif}`}
                          className="block h-full bg-white origin-left rtl:origin-right"
                          style={actif
                            ? { animation: `hero-progress ${secondes}s linear forwards` }
                            : { transform: 'scaleX(1)' }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mobile : simples points */}
              <div className="flex-1 flex md:hidden justify-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => aller(i)}
                    aria-label={t('hero_slide_of', { current: i + 1, total: slides.length })}
                    aria-current={i === index}
                    className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
              </div>

              <div className="shrink-0 flex gap-2">
                <button type="button" onClick={precedent} aria-label={t('hero_prev')}
                  className="w-11 h-11 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/10 transition">
                  {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <button type="button" onClick={suivant} aria-label={t('hero_next')}
                  className="w-11 h-11 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/10 transition">
                  {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
