'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Loan {
  id: number;
  book: { titre: string; image?: string } | null;
  date_pret: string;
  date_retour_prevue: string;
  date_retour_reelle?: string;
  statut: 'en cours' | 'en retard' | 'retourné';
  jours_restants: number | null;
  jours_retard: number | null;
}

export default function MyLoansPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-loans')
      .then(({ data }) => setLoans(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">📚 {t('loans_title')}</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>
        ) : loans.length ? (
          <div className="space-y-4">
            {loans.map((loan) => {
              const isLate = loan.statut === 'en retard';
              const isReturned = loan.statut === 'retourné';

              return (
                <div key={loan.id} className="bg-white rounded-2xl border border-stone-200 shadow-soft p-5 flex gap-5">
                  <div className="w-20 h-28 rounded-xl bg-sand overflow-hidden shrink-0">
                    {loan.book?.image && (
                      <Image src={loan.book.image} alt={loan.book.titre} width={80} height={112} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 mb-2">{loan.book?.titre}</h3>
                    <div className="text-sm text-stone-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar size={14} /> {t('borrowed_on')} {formatDate(loan.date_pret, locale)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} /> {t('due_on')} {formatDate(loan.date_retour_prevue, locale)}
                      </p>
                    </div>

                    <div className="mt-3">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full">
                          <CheckCircle size={14} /> {t('returned')} · {formatDate(loan.date_retour_reelle, locale)}
                        </span>
                      ) : isLate ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-coral-50 text-coral-700 rounded-full">
                          <AlertCircle size={14} /> {t('late', { count: loan.jours_retard ?? 0 })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full">
                          <CheckCircle size={14} /> {t('remaining', { count: loan.jours_restants ?? 0 })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">{t('no_loans_any')}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
