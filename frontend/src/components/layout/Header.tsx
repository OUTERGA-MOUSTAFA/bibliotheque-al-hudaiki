'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Search, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-800 shrink-0">
            <span className="text-2xl">📚</span>
            <span className="hidden sm:inline">Al Hudaiki</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-stone-700 hover:text-emerald-700 transition">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-stone-100 transition"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => switchLocale('fr')}
                className={`px-2 py-1 rounded transition ${
                  locale === 'fr' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-100'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => switchLocale('ar')}
                className={`px-2 py-1 rounded transition ${
                  locale === 'ar' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-100'
                }`}
              >
                ع
              </button>
            </div>

            <Link href="/login" className="hidden md:block">
              <Button size="sm" variant="outline">{t('login')}</Button>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded hover:bg-stone-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <input
              type="search"
              placeholder={t('search')}
              className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-stone-100 text-stone-700"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-2" size="sm">{t('login')}</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}