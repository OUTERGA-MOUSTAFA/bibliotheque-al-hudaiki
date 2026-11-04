'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Archive, RotateCcw, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { AdminUser, PaginatedResponse } from '@/types';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    api.get<PaginatedResponse<AdminUser>>('/admin/users')
      .then(({ data }) => {
        setUsers(data.data || []);
        setTotal(data.total ?? data.data?.length ?? 0);
      })
      .catch((err) => toast.error(apiErrorMessage(err, t('load_error'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleArchive = async (u: AdminUser) => {
    const archived = u.statut === 'archive';
    if (!archived && !confirm(t('confirm_archive_user'))) return;
    try {
      await api.patch(`/admin/users/${u.id}/${archived ? 'restore' : 'archive'}`);
      toast.success(archived ? t('user_restored') : t('user_archived'));
      fetchUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(t('confirm_delete_user'))) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success(t('deleted'));
      fetchUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('delete_error')));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('users')}</h1>
        <p className="text-stone-500 text-sm">{t('users_count', { count: total })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => {
          const archived = u.statut === 'archive';
          const isAdmin = u.roles?.some((r) => r.name === 'admin');
          const isMe = u.id === me?.id;
          return (
            <div key={u.id} className={`bg-white rounded-2xl shadow-soft border border-stone-200 p-5 ${archived ? 'opacity-75' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-coral-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {u.prenom?.[0]}{u.nom?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-900 truncate">{u.prenom} {u.nom}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${archived ? 'bg-stone-100 text-stone-600' : 'bg-brand-50 text-brand-700'}`}>
                      {archived ? t('status_archived') : t('status_active')}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 inline-flex items-center gap-1">
                        <ShieldCheck size={10} /> Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                <div className="flex items-center gap-2 truncate" dir="ltr"><Mail size={12} /> {u.email}</div>
                {u.telephone && <div className="flex items-center gap-2" dir="ltr"><Phone size={12} /> {u.telephone}</div>}
              </div>

              {/* L'API refuse toute action sur son propre compte : on ne propose pas les boutons */}
              {!isMe && (
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleArchive(u)}
                    className="flex-1 border border-stone-200 hover:bg-gold-50 hover:border-gold-200 py-2 rounded-lg text-xs font-semibold text-stone-700 transition flex items-center justify-center gap-1.5"
                  >
                    {archived ? <><RotateCcw size={14} /> {t('restore')}</> : <><Archive size={14} /> {t('archive')}</>}
                  </button>
                  <button
                    onClick={() => deleteUser(u)}
                    className="p-2 rounded-lg hover:bg-coral-50 text-coral-600 transition border border-stone-200"
                    title={t('delete')}
                    aria-label={t('delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
