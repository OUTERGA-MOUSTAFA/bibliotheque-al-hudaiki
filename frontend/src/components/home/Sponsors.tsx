import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Handshake } from 'lucide-react';
import type { Sponsor } from '@/types';

export default function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const t = useTranslations('home');
  if (!sponsors?.length) return null;

  return (
    <section className="py-16 bg-sand border-t border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-10">
          <Handshake size={20} className="text-brand-600" />
          <h2 className="text-xl font-bold text-stone-700">{t('sponsors')}</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12">
          {sponsors.map((s) => (
            <a
              key={s.id}
              href={s.lien_externe}
              target="_blank"
              rel="noopener noreferrer"
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition duration-300 hover:scale-105"
            >
              <Image
                src={s.logo}
                alt={s.nom}
                width={120}
                height={60}
                className="object-contain h-12 w-auto"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}