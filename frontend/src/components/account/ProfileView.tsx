'use client';

import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/navigation';
import { User, Heart, BookMarked, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileView() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-brand-glow">
            {initials || <User />}
          </div>
          <div className="flex-1 text-center sm:text-start">
            <h1 className="text-2xl font-bold text-stone-900">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-stone-600 text-sm">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded-full font-semibold">
                {user.roles?.includes('admin') ? '👑 مدير' : '👤 قارئ'}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="text-coral-600 hover:bg-coral-50">
            <LogOut size={16} className="mr-2" /> Déconnexion
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/compte/favoris" className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6 hover:shadow-soft-lg transition group">
          <div className="w-12 h-12 rounded-xl bg-coral-50 flex items-center justify-center mb-4 group-hover:bg-coral-100 transition">
            <Heart className="text-coral-500" size={22} />
          </div>
          <h3 className="font-bold text-stone-900">مفضلتي</h3>
          <p className="text-sm text-stone-500 mt-1">Mes favoris</p>
        </Link>

        <Link href="/compte/emprunts" className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6 hover:shadow-soft-lg transition group">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition">
            <BookMarked className="text-brand-600" size={22} />
          </div>
          <h3 className="font-bold text-stone-900">إعاراتي</h3>
          <p className="text-sm text-stone-500 mt-1">Mes emprunts</p>
        </Link>

        <Link href="/compte/parametres" className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6 hover:shadow-soft-lg transition group">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition">
            <Settings className="text-sky-600" size={22} />
          </div>
          <h3 className="font-bold text-stone-900">الإعدادات</h3>
          <p className="text-sm text-stone-500 mt-1">Paramètres</p>
        </Link>
      </div>
    </div>
  );
}