'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Menu, X, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // loading = true pendant l'hydratation : on n'affiche pas encore l'état connecté (évite un écart serveur/client)
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Le menu mobile se referme dès qu'on change de page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Change de langue en restant sur la même page, filtres compris (ex. /catalogue?categorie=5).
  // next-intl mémorise le choix (cookie NEXT_LOCALE) : la prochaine visite s'ouvre dans cette langue.
  const switchLocale = (newLocale: 'fr' | 'ar') => {
    if (newLocale === locale) return;
    router.replace(`${pathname}${window.location.search}`, { locale: newLocale });
  };

  const links = [
    { href: '/', label: t('home') },
    { href: '/catalogue', label: t('catalog') },
    { href: '/categories', label: t('categories') },
    { href: '/histoire', label: t('history') },
    { href: '/contact', label: t('contact') },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-stone-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand-glow group-hover:scale-105 transition">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-stone-900 text-sm">مكتبة الحظيكي</span>
              <span className="text-[10px] text-brand-700 font-semibold tracking-wide">AL HUDAIKI LIBRARY</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${isActive(l.href) ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-brand-50 hover:text-brand-700'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 rounded-full p-0.5">
              <button onClick={() => switchLocale('fr')} lang="fr" aria-label="Français" aria-pressed={locale === 'fr'} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'fr' ? 'bg-brand-600 text-white' : 'text-stone-500'}`}>FR</button>
              <button onClick={() => switchLocale('ar')} lang="ar" aria-label="العربية" aria-pressed={locale === 'ar'} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'ar' ? 'bg-brand-600 text-white' : 'text-stone-500'}`}>ع</button>
            </div>

            {loading ? (
              <div className="w-24 h-8 bg-stone-200 animate-pulse rounded-full hidden md:block" />
            ) : isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-white rounded-full px-4 font-bold">
                      <ShieldCheck size={16} className="me-2" /> {t('admin')}
                    </Button>
                  </Link>
                )}
                <Link href="/compte">
                  <Button size="sm" variant="outline" className="rounded-full px-4 border-stone-300">
                    <UserIcon size={16} className="me-2" /> {user?.prenom}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={logout} className="text-coral-600 hover:bg-coral-50 rounded-full" title={t('logout')} aria-label={t('logout')}>
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-6">
                  {t('login')}
                </Button>
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-full hover:bg-stone-100"
              aria-label={t('menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile : navigation + compte, invisible à partir de md */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-stone-200/60 bg-cream">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(l.href) ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-brand-50'}`}
              >
                {l.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-stone-200" />

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gold-700 hover:bg-gold-50 flex items-center gap-2">
                    <ShieldCheck size={16} /> {t('admin')}
                  </Link>
                )}
                <Link href="/compte" className="px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-brand-50 flex items-center gap-2">
                  <UserIcon size={16} /> {t('account')}
                </Link>
                <button onClick={logout} className="px-3 py-2.5 rounded-lg text-sm font-medium text-coral-600 hover:bg-coral-50 flex items-center gap-2 text-start">
                  <LogOut size={16} /> {t('logout')}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl">{t('login')}</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl">{t('register')}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
