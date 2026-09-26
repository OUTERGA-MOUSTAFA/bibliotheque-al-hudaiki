'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Search, Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const switchLocale = (newLocale: 'fr' | 'ar') => {
    router.replace(pathname, { locale: newLocale });
  };

  const links = [
    { href: '/', label: t('home') },
    { href: '/catalogue', label: t('catalog') },
    { href: '/categories', label: t('categories') },
    { href: '/histoire', label: t('history') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-stone-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand-glow group-hover:scale-105 transition">
              <BookOpen className="text-white" size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-stone-900 text-sm">مكتبة الهدائكي</span>
              <span className="text-[10px] text-brand-700 font-semibold tracking-wide">AL HUDAIKI LIBRARY</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-stone-700 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-brand-50 hover:text-brand-700 transition text-stone-600"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Language switcher */}
            <div className="flex items-center bg-stone-100 rounded-full p-0.5">
              <button
                onClick={() => switchLocale('fr')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  locale === 'fr'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => switchLocale('ar')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  locale === 'ar'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                ع
              </button>
            </div>

            <Link href="/login" className="hidden md:block">
              <Button
                size="sm"
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-5"
              >
                {t('login')}
              </Button>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-stone-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4">
            <input
              type="search"
              placeholder={t('search')}
              className="w-full px-5 py-3 rounded-xl bg-sand border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/catalogue?q=${e.currentTarget.value}`);
                  setSearchOpen(false);
                }
              }}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-cream">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-stone-700 font-medium"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-2 bg-brand-600 hover:bg-brand-700 rounded-xl" size="lg">
                {t('login')}
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}