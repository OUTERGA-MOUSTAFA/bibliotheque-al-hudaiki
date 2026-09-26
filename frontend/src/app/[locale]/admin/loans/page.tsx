'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Loader2, CheckCircle, Trash2, Phone } from 'lucide-react';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    api.get('/admin/loans')
      .then(({ data }) => setLoans(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const returnBook = async (id: number) => {
    try {
      await api.post(`/admin/loans/${id}/return`);
      fetchLoans();
    } catch (err) { alert('خطأ'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">الإعارات النشطة</h1>
        <p className="text-stone-500 text-sm">{loans.length} إعارة جارية</p>
      </div>

      {loans.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loans.map((loan) => {
            const isLate = loan.jours_retard > 0;
            return (
              <div key={loan.id} className={`bg-white rounded-2xl shadow-soft border-2 p-5 ${isLate ? 'border-coral-200' : 'border-stone-200'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shrink-0">
                    {loan.lecteur?.prenom?.[0]}{loan.lecteur?.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 truncate">
                      {loan.lecteur?.prenom} {loan.lecteur?.nom}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {loan.lecteur?.telephone}
                    </div>
                  </div>
                </div>

                <div className="bg-sand rounded-xl p-3 mb-4 flex gap-3">
                  <div className="w-10 h-14 rounded-lg bg-white overflow-hidden shrink-0">
                    {loan.livre?.image && (
                      <Image src={loan.livre.image} alt={loan.livre.titre} width={40} height={56} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 line-clamp-2">{loan.livre?.titre}</div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      إرجاع: {new Date(loan.date_retour_prevue).toLocaleDateString('ar-MA')}
                    </div>
                  </div>
                </div>

                {isLate && (
                  <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 mb-4 text-xs text-coral-700 font-semibold">
                    ⚠️ متأخر بـ {loan.jours_retard} يوم
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => returnBook(loan.id)}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> إرجاع
                  </button>
                  <button className="p-2.5 rounded-xl hover:bg-coral-50 text-coral-600 transition border border-stone-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <div className="text-6xl mb-3">📚</div>
          <p className="text-stone-500">لا توجد إعارات نشطة</p>
        </div>
      )}
    </div>
  );
}
