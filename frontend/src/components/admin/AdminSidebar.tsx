'use client';

import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, BookOpen, Users, BookMarked, LogOut, Tag, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  // 👇 Jbedna loading mn useAuth 3iwed mounted
  const { logout, user, loading } = useAuth();

  const LINKS = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/books', label: t('books'), icon: BookOpen },
    { href: '/admin/loans', label: t('loans'), icon: BookMarked },
    { href: '/admin/users', label: t('users'), icon: Users },
  ];

  return (
    <aside className="w-64 bg-night text-white min-h-screen flex flex-col shrink-0 hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <div className="text-[10px] font-bold text-gold-400 tracking-[0.2em]">ADMIN PANEL</div>
        <div className="text-sm font-bold mt-1">مكتبة الحظيكي</div>
      </div>

      <div className="p-4 border-b border-white/10 h-[72px]">
        {/* 👇 Hna khesta3mlo loading */}
        {loading ? (
          <div className="w-full h-8 bg-white/10 animate-pulse rounded"></div>
        ) : (
          <>
            <div className="text-xs text-stone-400">مرحباً</div>
            <div className="text-sm font-semibold truncate">{user?.prenom} {user?.nom}</div>
          </>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {LINKS.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white shadow-brand-glow' : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-300 hover:bg-white/5 transition mb-1">
          <Store size={18} /> <span>{t('main_site')}</span>
        </Link>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral-400 hover:bg-coral-500/10 w-full transition text-start">
          <LogOut size={18} /> <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}