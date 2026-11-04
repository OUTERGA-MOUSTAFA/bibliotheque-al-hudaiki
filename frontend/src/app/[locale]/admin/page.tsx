'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, BookMarked, Users, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/types';

const colorMap = {
  brand: 'bg-brand-50 text-brand-600',
  sky: 'bg-sky-50 text-sky-600',
  coral: 'bg-coral-50 text-coral-600',
  gold: 'bg-gold-50 text-gold-600',
} as const;

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;
  if (!data) return <div className="text-center py-12 text-stone-500">{t('load_error')}</div>;

  const cards = [
    { label: t('stat_books'), value: data.stats.total_books, icon: BookOpen, color: 'brand' },
    { label: t('stat_active_loans'), value: data.stats.active_loans, icon: BookMarked, color: 'sky' },
    { label: t('stat_late_loans'), value: data.stats.late_loans, icon: AlertCircle, color: 'coral' },
    { label: t('stat_users'), value: data.stats.total_users, icon: Users, color: 'gold' },
  ] as const;

  const dateFormat = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('dashboard')}</h1>
        <p className="text-stone-500 text-sm">{t('dashboard_hint')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
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
          <TrendingUp size={18} /> {t('recent_loans')}
        </h2>
        {data.recent_loans?.length ? (
          <div className="space-y-3">
            {data.recent_loans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between gap-4 py-3 border-b border-stone-100 last:border-0">
                <div className="text-sm min-w-0">
                  <span className="font-semibold">{loan.user ? `${loan.user.prenom} ${loan.user.nom}` : t('deleted_user')}</span>
                  <span className="text-stone-500"> — {loan.book?.titre}</span>
                </div>
                <span className="text-xs text-stone-400 shrink-0">{dateFormat.format(new Date(loan.created_at))}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">{t('no_recent_loans')}</p>
        )}
      </div>
    </div>
  );
}
