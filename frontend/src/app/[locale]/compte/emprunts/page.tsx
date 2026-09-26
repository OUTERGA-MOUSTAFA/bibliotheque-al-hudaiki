'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface Loan {
  id: number;
  book: { titre: string; image?: string };
  date_pret: string;
  date_retour_prevue: string;
  date_retour_reelle?: string;
  statut: string;
  jours_restants: number;
  jours_retard: number;
}

export default function MyLoansPage() {
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
        <h1 className="text-3xl font-bold text-stone-900 mb-8">📚 إعاراتي / Mes emprunts</h1>

        {loading ? (
          <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>
        ) : loans.length ? (
          <div className="space-y-4">
            {loans.map((loan) => {
              const isLate = loan.statut === 'en retard';
              const isReturned = loan.statut === 'retourné';

              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-soft p-5 flex gap-5"
                >
                  <div className="w-20 h-28 rounded-xl bg-sand overflow-hidden shrink-0">
                    {loan.book.image ? (
                      <Image src={loan.book.image} alt={loan.book.titre} width={80} height={112} className="object-cover w-full h-full" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-900 mb-2">{loan.book.titre}</h3>
                    <div className="text-sm text-stone-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar size={14} />
                        Emprunté le {new Date(loan.date_pret).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} />
                        Retour prévu le {new Date(loan.date_retour_prevue).toLocaleDateString()}
                      </p>
                    </div>

                    {!isReturned && (
                      <div className="mt-3">
                        {isLate ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-coral-50 text-coral-700 rounded-full">
                            <AlertCircle size={14} />
                            متأخر بـ {loan.jours_retard} يوم
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full">
                            <CheckCircle size={14} />
                            متبقي {loan.jours_restants} يوم
                          </span>
                        )}
                      </div>
                    )}

                    {isReturned && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full mt-3">
                        <CheckCircle size={14} />
                        تم الإرجاع
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">لا توجد إعارات</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}