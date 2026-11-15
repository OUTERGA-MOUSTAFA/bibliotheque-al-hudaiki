import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Mail, MapPin, Globe, Send } from 'lucide-react';
import GraniteLandscape from '@/components/tafraout/GraniteLandscape';
import LibraryMark from '@/components/tafraout/LibraryMark';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  const links = [
    { href: '/',            label: tNav('home') },
    { href: '/catalogue',   label: tNav('catalog') },
    { href: '/categories',  label: tNav('categories') },
    { href: '/contact',     label: tNav('contact') },
    { href: '/histoire',    label: tNav('history') },
  ];

  return (
    <footer className="relative mt-24 text-indigo-night-100">
      {/* Les rochers de Tafraout en silhouette : le pied de page commence à l'horizon */}
      <GraniteLandscape variant="silhouette" className="block w-full h-14 sm:h-20 -mb-px" />
      <div className="bg-night">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand — col-span-5 */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <LibraryMark className="w-12 h-12 [&>path:first-child]:fill-indigo-night-700" />
              <div>
                <div className="font-display font-semibold text-cream text-lg">{t('brand')}</div>
                {/* Tafraout écrit en tifinagh, l'alphabet amazigh */}
                <div className="text-sm text-granite-300" lang="zgh" title="Tafraout">ⵜⴰⴼⵔⴰⵡⵜ</div>
              </div>
            </div>

            <p className="text-sm text-indigo-night-100/75 max-w-md leading-relaxed mb-6">
              {t('about_text')}
            </p>

            {/* Social — brand colored */}
            <div className="flex gap-3">
              <a
                href="https://portfolio-wwhz.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-600 border border-white/10 flex items-center justify-center transition group"
                aria-label="Portfolio"
              >
                <Globe size={16} className="text-indigo-night-100/75 group-hover:text-white transition" />
              </a>
              <a
                href="mailto:outergamoustafa@gmail.com"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gold-600 border border-white/10 flex items-center justify-center transition group"
                aria-label="Email"
              >
                <Send size={16} className="text-indigo-night-100/75 group-hover:text-white transition" />
              </a>
            </div>
          </div>

          {/* Links — col-span-4 */}
          <div className="md:col-span-4">
            <h3 className="font-display text-cream font-semibold mb-5 text-base">
              {t('links')}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-indigo-night-100/75 hover:text-gold-400 transition inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-granite-400 group-hover:bg-gold-400 group-hover:w-3 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — col-span-3 */}
          <div className="md:col-span-3">
            <h3 className="font-display text-cream font-semibold mb-5 text-base">
              {t('contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-indigo-night-100/75">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-granite-300" />
                </div>
                <span className="pt-1">{t('city')}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gold-600/20 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-gold-400" />
                </div>
                <a
                  href="mailto:outergamoustafa@gmail.com"
                  className="text-indigo-night-100/75 hover:text-gold-400 transition pt-1 break-all"
                >
                  outergamoustafa@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-indigo-night-100/55 text-center sm:text-start">
            {t('copyright', { year })}
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/confidentialite" className="text-indigo-night-100/55 hover:text-gold-400 transition">
              {t('privacy')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}