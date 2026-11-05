'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { HeroSlide } from '@/types';
import HeroLink, { imageNonOptimisee } from './HeroLink';
import { useAutoplay } from './useAutoplay';

// Modèle « texte + image » : texte d'un côté, grande photo arrondie de l'autre
// (côté inversé automatiquement en arabe). Plusieurs diapositives : fondu entre les images.
export default function HeroSplit({ slides, secondes }: { slides: HeroSlide[]; secondes: number }) {
  const t = useTranslations('home');
  const isRtl = useLocale() === 'ar';
  const { index, aller, survolProps } = useAutoplay(slides.length, secondes);
  const s = slides[index];
  const Fleche = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative bg-cream overflow-hidden" aria-label={t('hero_label')} {...survolProps}>
      {/* Formes décoratives discrètes */}
      <div className="absolute -top-32 end-[-8rem] w-[28rem] h-[28rem] rounded-full bg-brand-600/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 start-[-6rem] w-72 h-72 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Texte : change avec la diapositive (aria-live pour les lecteurs d'écran) */}
        <div key={s.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500" aria-live="polite">
          {s.badge && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-stone-700 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500" aria-hidden />
              {s.badge}
            </span>
          )}
          {s.titre && (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.1] tracking-tight mb-6">
              {s.titre}
            </h1>
          )}
          {s.sous_titre && <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-xl">{s.sous_titre}</p>}

          <div className="flex flex-wrap items-center gap-4">
            {s.bouton && s.lien && (
              <HeroLink
                href={s.lien}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-7 h-12 shadow-brand-glow transition"
              >
                {s.bouton} <Fleche size={18} />
              </HeroLink>
            )}
            {s.lien !== '/catalogue' && (
              <Link href="/catalogue" className="inline-flex items-center gap-2 text-stone-700 font-semibold hover:text-brand-700 h-12 px-2 transition">
                {t('hero_cta')} <Fleche size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="absolute -inset-4 sm:-inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-transparent to-gold-400/25" aria-hidden />
          <div className="relative aspect-[4/3] lg:aspect-[5/4] rounded-[2rem] overflow-hidden shadow-soft-lg bg-stone-200">
            {slides.map((sl, i) => (
              <Image
                key={sl.id}
                src={sl.image}
                alt={sl.titre ?? ''}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 600px"
                unoptimized={imageNonOptimisee(sl.image)}
                className={`object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={i !== index}
              />
            ))}
          </div>

          {slides.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {slides.map((sl, i) => (
                <button
                  key={sl.id}
                  type="button"
                  onClick={() => aller(i)}
                  aria-label={t('hero_slide_of', { current: i + 1, total: slides.length })}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-brand-600' : 'w-2 bg-stone-300 hover:bg-stone-400'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
