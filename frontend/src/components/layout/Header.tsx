'use client';

import { useEffect, useState } from 'react'; // 👈 Zid hadou
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Search, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // 👈 Zid hada

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  // 👇 Zidna hadou bach n7alou l'Hydration Error w n3arfou wesh connecté
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 👇 Had l'useEffect kat7el l'Issue li f l'te7t
  useEffect(() => {
    setMounted(true);
  }, []);

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
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-stone-900 text-sm">مكتبة الحظيكي</span>
              <span className="text-[10px] text-brand-700 font-semibold tracking-wide">AL HUDAIGY LIBRARY</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-stone-700 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-brand-50 text-stone-600">
              <Search size={18} />
            </button>

            <div className="flex items-center bg-stone-100 rounded-full p-0.5">
              <button onClick={() => switchLocale('fr')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'fr' ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-500'}`}>FR</button>
              <button onClick={() => switchLocale('ar')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'ar' ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-500'}`}>ع</button>
            </div>

            {/* 👇 HNA FIN KAYT7YED L'BUTTON W KAYTBEDDEL */}
            {!mounted ? (
              <div className="w-24 h-8 bg-stone-200 animate-pulse rounded-full hidden md:block"></div>
            ) : isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/compte">
                  <Button size="sm" variant="outline" className="rounded-full px-4 border-stone-300">
                    <UserIcon size={16} className="mr-2" />
                    {user?.prenom}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={logout} className="text-coral-600 hover:bg-coral-50 rounded-full">
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

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-full hover:bg-stone-100">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav (Nfs l'haja hna) */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-stone-200 bg-cream">
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-stone-700 font-medium">
                  {l.label}
                </Link>
              ))}
              {mounted && isAuthenticated ? (
                <>
                  <Link href="/compte" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full mt-2 rounded-xl" size="lg" variant="outline">
                      <UserIcon size={16} className="mr-2" /> {user?.prenom}
                    </Button>
                  </Link>
                  <Button onClick={() => { logout(); setMobileOpen(false); }} className="w-full mt-2 rounded-xl bg-coral-50 text-coral-600 hover:bg-coral-100" size="lg">
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full mt-2 bg-brand-600 hover:bg-brand-700 rounded-xl" size="lg">
                    {t('login')}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}