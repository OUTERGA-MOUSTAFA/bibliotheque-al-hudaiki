import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('home');
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-6">
            {t('hero_title')}
          </h1>
          <p className="text-lg sm:text-xl text-stone-700 mb-8">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/catalogue">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                {t('hero_cta')} <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}