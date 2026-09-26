import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Mail, MapPin, BookOpen, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="section-dark mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <BookOpen className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-bold text-white">مكتبة الهدائكي</div>
                <div className="text-[10px] text-brand-400 tracking-wider">AL HUDAIKI LIBRARY</div>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              {t('about_text')}
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-600 flex items-center justify-center transition">
                <Facebook size={16} className="text-stone-300" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-600 flex items-center justify-center transition">
                <Instagram size={16} className="text-stone-300" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('links')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-stone-400 hover:text-gold-400 transition">{tNav('home')}</Link></li>
              <li><Link href="/catalogue" className="text-stone-400 hover:text-gold-400 transition">{tNav('catalog')}</Link></li>
              <li><Link href="/contact" className="text-stone-400 hover:text-gold-400 transition">{tNav('contact')}</Link></li>
              <li><Link href="/histoire" className="text-stone-400 hover:text-gold-400 transition">{tNav('history')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-stone-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
                <span>Tafraout, Maroc</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Mail size={16} className="shrink-0 text-brand-500" />
                <a href="mailto:outergamoustafa@gmail.com" className="hover:text-gold-400 transition">
                  outergamoustafa@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-sm text-stone-500">
            © {year} مكتبة الهدائكي. {t('rights')}.
          </p>
          <div className="flex gap-6 text-sm text-stone-500">
            <a href="#" className="hover:text-gold-400 transition">{t('privacy')}</a>
            <a href="#" className="hover:text-gold-400 transition">{t('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}