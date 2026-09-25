import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="text-2xl">📚</span>
              <span>Bibliothèque Al Hudaiki</span>
            </div>
            <p className="text-sm text-stone-400 max-w-md">
              Tafraout, Maroc — Une bibliothèque moderne au service de la lecture et de la culture.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">{t('links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400">{tNav('home')}</Link></li>
              <li><Link href="/catalogue" className="hover:text-emerald-400">{tNav('catalog')}</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400">{tNav('contact')}</Link></li>
              <li><Link href="/histoire" className="hover:text-emerald-400">{tNav('history')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">{t('contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Tafraout, Maroc</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:outergamoustafa@gmail.com" className="hover:text-emerald-400">
                  outergamoustafa@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-800 text-sm text-center text-stone-500">
          © {year} Bibliothèque Al Hudaiki. {t('rights')}.
        </div>
      </div>
    </footer>
  );
}