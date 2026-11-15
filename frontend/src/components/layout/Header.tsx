'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Menu, X, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import LibraryMark from '@/components/tafraout/LibraryMark';

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
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2.5 group shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
            <LibraryMark className="w-10 h-10 transition-transform duration-300 group-hover:rotate-45" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-semibold text-night text-base" lang="ar">مكتبة الحظيكي</span>
              <span className="text-xs text-granite-700 font-medium" lang="fr">Bibliothèque Al Hudaiki</span>
            </div>
          </Link>

          {/* Menu principal : de vrais boutons regroupés dans une barre, la page active remplie en vert */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white border border-stone-200 p-1 shadow-sm" aria-label={t('main_menu')}>
            {links.map((l) => {
              const actif = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={actif ? 'page' : undefined}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${actif
                    ? 'bg-brand-600 text-white shadow-brand-glow'
                    : 'text-stone-700 hover:bg-brand-50 hover:text-brand-700 active:scale-95'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-stone-200 rounded-full p-0.5 shadow-sm">
              <button onClick={() => switchLocale('fr')} lang="fr" aria-label="Français" aria-pressed={locale === 'fr'} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'fr' ? 'bg-brand-600 text-white' : 'text-stone-500 hover:text-brand-700 hover:bg-brand-50'}`}>FR</button>
              <button onClick={() => switchLocale('ar')} lang="ar" aria-label="العربية" aria-pressed={locale === 'ar'} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'ar' ? 'bg-brand-600 text-white' : 'text-stone-500 hover:text-brand-700 hover:bg-brand-50'}`}>ع</button>
            </div>

            {loading ? (
              <div className="w-24 h-8 bg-stone-200 animate-pulse rounded-full hidden lg:block" />
            ) : isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin" className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-gold-500 hover:bg-gold-600 text-white text-sm font-bold shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2">
                    <ShieldCheck size={16} /> {t('admin')}
                  </Link>
                )}
                <Link href="/compte" className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white border border-stone-300 hover:border-brand-400 hover:text-brand-700 text-sm font-semibold text-stone-800 shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                  <UserIcon size={16} /> {user?.prenom}
                </Link>
                <Button size="sm" variant="ghost" onClick={logout} className="text-coral-600 hover:bg-coral-50 border border-transparent hover:border-coral-200 rounded-full" title={t('logout')} aria-label={t('logout')}>
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:inline-flex items-center h-9 px-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-brand-glow transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                {t('login')}
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-100"
              aria-label={t('menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile : navigation + compte, invisible à partir de lg */}
      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-stone-200/60 bg-cream">
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
                <Link href="/login" className="flex items-center justify-center h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition active:scale-95">
                  {t('login')}
                </Link>
                <Link href="/register" className="flex items-center justify-center h-10 rounded-xl border border-stone-300 bg-white hover:border-brand-400 hover:text-brand-700 text-sm font-semibold transition active:scale-95">
                  {t('register')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
