import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Sponsor } from '@/types';

export default function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const t = useTranslations('home');
  if (!sponsors?.length) return null;

  return (
    <section className="py-16 bg-white border-t border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-stone-900 mb-8">
          🤝 {t('sponsors')}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {sponsors.map((s) => (
            <a
              key={s.id}
              href={s.lien_externe}
              target="_blank"
              rel="noopener noreferrer"
              className="grayscale hover:grayscale-0 transition opacity-70 hover:opacity-100"
            >
              <Image
                src={s.logo}
                alt={s.nom}
                width={120}
                height={60}
                className="object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}