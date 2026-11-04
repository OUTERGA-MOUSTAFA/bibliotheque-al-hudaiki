'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Mail, MailOpen, Trash2, Inbox, Reply } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import type { ContactMessage, PaginatedResponse } from '@/types';

type Filtre = 'tous' | 'non_lus';

export default function AdminContactsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [nonLus, setNonLus] = useState(0);
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const fetchMessages = useCallback(() => {
    api.get<PaginatedResponse<ContactMessage> & { non_lus: number }>('/admin/contacts', {
      params: filtre === 'non_lus' ? { filtre } : {},
    })
      .then(({ data }) => {
        setMessages(data.data || []);
        setNonLus(data.non_lus ?? 0);
      })
      .catch((err) => toast.error(apiErrorMessage(err, t('load_error'))))
      .finally(() => setLoading(false));
  }, [filtre, t]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const setLu = async (m: ContactMessage, lu: boolean) => {
    try {
      await api.patch(`/admin/contacts/${m.id}/read`, { lu });
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, lu } : x)));
      setNonLus((n) => Math.max(0, n + (lu ? -1 : 1)));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    }
  };

  const open = (m: ContactMessage) => {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.lu) setLu(m, true);
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(t('confirm_delete_message'))) return;
    try {
      await api.delete(`/admin/contacts/${m.id}`);
      toast.success(t('deleted'));
      fetchMessages();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('delete_error')));
    }
  };

  const dateFormat = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('messages')}</h1>
          <p className="text-stone-500 text-sm">{t('unread_count', { count: nonLus })}</p>
        </div>
        <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 text-sm">
          {(['tous', 'non_lus'] as Filtre[]).map((f) => (
            <button
              key={f}
              onClick={() => { if (f !== filtre) { setLoading(true); setFiltre(f); } }}
              className={`px-4 py-1.5 rounded-lg font-medium transition ${filtre === f ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-sand'}`}
            >
              {f === 'tous' ? t('filter_all') : t('filter_unread')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          <Inbox className="mx-auto mb-3 text-stone-300" size={40} />
          {t('no_messages')}
        </div>
      ) : (
        <ul className="bg-white rounded-2xl shadow-soft border border-stone-200 divide-y divide-stone-100 overflow-hidden">
          {messages.map((m) => (
            <li key={m.id} className={m.lu ? '' : 'bg-brand-50/40'}>
              <button onClick={() => open(m)} className="w-full text-start p-4 flex items-start gap-3 hover:bg-sand/60 transition">
                <span className={`mt-1 shrink-0 ${m.lu ? 'text-stone-300' : 'text-brand-600'}`}>
                  {m.lu ? <MailOpen size={18} /> : <Mail size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className={`truncate ${m.lu ? 'text-stone-700' : 'font-bold text-stone-900'}`}>{m.sujet}</span>
                    <time className="text-xs text-stone-400 shrink-0">{dateFormat.format(new Date(m.created_at))}</time>
                  </span>
                  <span className="block text-xs text-stone-500 truncate">{m.nom} · {m.email}</span>
                </span>
              </button>

              {openId === m.id && (
                <div className="px-4 pb-4 ps-11">
                  <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed bg-sand rounded-xl p-4 mb-3">{m.message}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700" dir="ltr">
                      <Reply size={14} /> {m.email}
                    </span>
                    <button onClick={() => setLu(m, !m.lu)} className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-sand font-semibold text-stone-700">
                      {m.lu ? t('mark_unread') : t('mark_read')}
                    </button>
                    <button onClick={() => remove(m)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-coral-200 hover:bg-coral-50 font-semibold text-coral-600">
                      <Trash2 size={14} /> {t('delete')}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
