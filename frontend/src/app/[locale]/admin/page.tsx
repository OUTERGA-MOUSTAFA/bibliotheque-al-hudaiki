'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, BookMarked, Users, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    );
  }

  if (!stats) return <div className="text-center py-12">Erreur de chargement</div>;

  const cards = [
    { label: 'إجمالي الكتب',       value: stats.stats.total_books,   icon: BookOpen,    color: 'brand' },
    { label: 'الإعارات النشطة',    value: stats.stats.active_loans,  icon: BookMarked,  color: 'sky' },
    { label: 'الإعارات المتأخرة', value: stats.stats.late_loans,    icon: AlertCircle, color: 'coral' },
    { label: 'المستخدمون',         value: stats.stats.total_users,   icon: Users,       color: 'gold' },
  ];

  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    sky:   'bg-sky-50 text-sky-600',
    coral: 'bg-coral-50 text-coral-600',
    gold:  'bg-gold-50 text-gold-600',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">لوحة التحكم</h1>
        <p className="text-stone-500 text-sm">نظرة عامة على المكتبة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[card.color]}`}>
                <Icon size={22} />
              </div>
              <div className="text-3xl font-bold text-stone-900">{card.value}</div>
              <div className="text-sm text-stone-500 mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} /> أحدث الإعارات
        </h2>
        {stats.recent_loans?.length ? (
          <div className="space-y-3">
            {stats.recent_loans.map((loan: any) => (
              <div key={loan.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                <div className="text-sm">
                  <span className="font-semibold">{loan.user?.prenom} {loan.user?.nom}</span>
                  <span className="text-stone-500"> — {loan.book?.titre}</span>
                </div>
                <span className="text-xs text-stone-400">
                  {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">لا توجد إعارات حديثة</p>
        )}
      </div>
    </div>
  );
}