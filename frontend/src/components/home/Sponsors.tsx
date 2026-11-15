import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Sponsor } from '@/types';

export default function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const t = useTranslations('home');
  if (!sponsors?.length) return null;

  return (
    <section className="py-16 bg-cream border-t border-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl text-center text-indigo-night-700 mb-10">{t('sponsors')}</h2>

        <div className="flex flex-wrap items-center justify-center gap-12">
          {sponsors.map((s) => (
            <a
              key={s.id}
              href={s.lien_externe || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition duration-300 hover:scale-105"
            >
              {s.logo ? (
                // unoptimized : le logo peut venir de n'importe quel site saisi par l'admin
                <Image
                  src={s.logo}
                  alt={s.nom}
                  width={120}
                  height={60}
                  unoptimized
                  className="object-contain h-12 w-auto"
                />
              ) : (
                <span className="font-bold text-stone-600">{s.nom}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}