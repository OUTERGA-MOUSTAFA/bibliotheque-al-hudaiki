'use client';

import { Link, usePathname } from '@/navigation';
import { LayoutDashboard, BookOpen, Users, BookMarked, LogOut, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/books', label: 'الكتب', icon: BookOpen },
  { href: '/admin/loans', label: 'الإعارات', icon: BookMarked },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/categories', label: 'التصنيفات', icon: Tag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-night text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="text-sm font-bold text-gold-400 tracking-wider">ADMIN</div>
        <div className="text-xs text-stone-400 mt-1">مكتبة الهدائكي</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-brand-glow'
                  : 'text-stone-300 hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral-400 hover:bg-coral-500/10 w-full transition"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}