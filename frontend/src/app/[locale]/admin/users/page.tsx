'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Archive, Trash2, Mail, Phone } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const archiveUser = async (id: number) => {
    if (!confirm('أرشفة المستخدم؟')) return;
    await api.patch(`/admin/users/${id}/archive`);
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('حذف المستخدم نهائياً؟')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">المستخدمون</h1>
        <p className="text-stone-500 text-sm">{users.length} مستخدم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-coral-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-900 truncate">
                  {user.prenom} {user.nom}
                </div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 ${
                  user.statut === 'actif' ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {user.statut}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600 mb-4">
              <div className="flex items-center gap-2 truncate">
                <Mail size={12} /> {user.email}
              </div>
              {user.telephone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {user.telephone}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => archiveUser(user.id)}
                className="flex-1 border border-stone-200 hover:bg-gold-50 hover:border-gold-200 py-2 rounded-lg text-xs font-semibold text-stone-700 transition flex items-center justify-center gap-1.5"
              >
                <Archive size={14} /> أرشفة
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                className="p-2 rounded-lg hover:bg-coral-50 text-coral-600 transition border border-stone-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
