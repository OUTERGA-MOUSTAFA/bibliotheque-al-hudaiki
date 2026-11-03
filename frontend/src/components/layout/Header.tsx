'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Search, Menu, X, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const t = useTranslations('nav');
  const tAccount = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Bach n7miw men Hydration Mismatch
  // Bach n7miw men Hydration Mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); 
  }, []);

  const switchLocale = (newLocale: 'fr' | 'ar') => router.replace(pathname, { locale: newLocale });

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
          
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand-glow group-hover:scale-105 transition">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-stone-900 text-sm">مكتبة الحظيكي</span>
              <span className="text-[10px] text-brand-700 font-semibold tracking-wide">AL HUDAIGY LIBRARY</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-stone-700 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 rounded-full p-0.5">
              <button onClick={() => switchLocale('fr')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'fr' ? 'bg-brand-600 text-white' : 'text-stone-500'}`}>FR</button>
              <button onClick={() => switchLocale('ar')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${locale === 'ar' ? 'bg-brand-600 text-white' : 'text-stone-500'}`}>ع</button>
            </div>

            {/* 👇 SECURITY: Hna fin kayt7ayed l'login ila kan connecté */}
            {!mounted ? (
              <div className="w-24 h-8 bg-stone-200 animate-pulse rounded-full hidden md:block"></div>
            ) : isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {user?.roles?.includes('admin') && (
                  <Link href="/admin">
                    <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-white rounded-full px-4 font-bold">
                      <ShieldCheck size={16} className="mr-2" /> Admin
                    </Button>
                  </Link>
                )}
                <Link href="/compte">
                  <Button size="sm" variant="outline" className="rounded-full px-4 border-stone-300">
                    <UserIcon size={16} className="mr-2" /> {user?.prenom}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={logout} className="text-coral-600 hover:bg-coral-50 rounded-full" title={tAccount('logout')}>
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

            <button onClick={() => {}} className="md:hidden p-2 rounded-full hover:bg-stone-100">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}