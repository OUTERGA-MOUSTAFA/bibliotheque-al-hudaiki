'use client';

import { Link, usePathname } from '@/navigation';
import { LayoutDashboard, BookOpen, Users, BookMarked, LogOut, Tag, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { href: '/admin',             label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/books',       label: 'الكتب',        icon: BookOpen },
  { href: '/admin/loans',       label: 'الإعارات',     icon: BookMarked },
  { href: '/admin/users',       label: 'المستخدمون',   icon: Users },
  { href: '/admin/categories',  label: 'التصنيفات',    icon: Tag },
  { href: '/admin/sponsors',    label: 'الشركاء',      icon: Store },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-night text-white min-h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="text-[10px] font-bold text-gold-400 tracking-[0.2em]">ADMIN PANEL</div>
        <div className="text-sm font-bold mt-1">مكتبة الهدائكي</div>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="text-xs text-stone-400">مرحباً</div>
        <div className="text-sm font-semibold truncate">
          {user?.prenom} {user?.nom}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {LINKS.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== '/admin' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-brand-glow'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-300 hover:bg-white/5 transition mb-1"
        >
          <Store size={18} />
          <span>الموقع العام</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral-400 hover:bg-coral-500/10 w-full transition text-start"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}