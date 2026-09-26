import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Mail, MapPin, BookOpen, Globe, Send } from 'lucide-react';

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
    <footer className="bg-night text-stone-300 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand — col-span-5 */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand-glow">
                <BookOpen className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-bold text-white text-base">مكتبة الهدائكي</div>
                <div className="text-[10px] text-brand-400 tracking-[0.15em] font-semibold">
                  AL HUDAIKI LIBRARY
                </div>
              </div>
            </div>

            <p className="text-sm text-stone-400 max-w-md leading-relaxed mb-6">
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
                <Globe size={16} className="text-stone-400 group-hover:text-white transition" />
              </a>
              <a
                href="mailto:outergamoustafa@gmail.com"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gold-600 border border-white/10 flex items-center justify-center transition group"
                aria-label="Email"
              >
                <Send size={16} className="text-stone-400 group-hover:text-white transition" />
              </a>
            </div>
          </div>

          {/* Links — col-span-4 */}
          <div className="md:col-span-4">
            <h3 className="text-white font-bold mb-5 text-xs uppercase tracking-[0.15em]">
              {t('links')}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-gold-400 transition inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:bg-gold-400 group-hover:w-3 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — col-span-3 */}
          <div className="md:col-span-3">
            <h3 className="text-white font-bold mb-5 text-xs uppercase tracking-[0.15em]">
              {t('contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-stone-400">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-brand-400" />
                </div>
                <span className="pt-1">Tafraout, Maroc</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gold-600/20 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-gold-400" />
                </div>
                <a
                  href="mailto:outergamoustafa@gmail.com"
                  className="text-stone-400 hover:text-gold-400 transition pt-1 break-all"
                >
                  outergamoustafa@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500 text-center sm:text-start">
            © {year} مكتبة الهدائكي — جميع الحقوق محفوظة
          </p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="text-stone-500 hover:text-gold-400 transition">
              {t('privacy')}
            </a>
            <a href="#" className="text-stone-500 hover:text-gold-400 transition">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}