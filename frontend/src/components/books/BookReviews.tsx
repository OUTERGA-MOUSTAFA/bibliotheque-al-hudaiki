'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { BookDetails } from '@/types';

function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-0.5" dir="ltr" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = (
          <Star size={size} className={n <= shown ? 'text-gold-400' : 'text-stone-300'} fill={n <= shown ? 'currentColor' : 'none'} />
        );
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} / 5`} className="p-0.5">
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </div>
  );
}

export default function BookReviews({ details, onChanged }: { details: BookDetails; onChanged: () => void }) {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const { user, isAdmin } = useAuth();
  const [note, setNote] = useState(details.my_review?.note ?? 0);
  const [commentaire, setCommentaire] = useState(details.my_review?.commentaire ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(details.my_review?.note ?? 0);
    setCommentaire(details.my_review?.commentaire ?? '');
  }, [details.my_review]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note < 1) {
      toast.error(t('choose_rating'));
      return;
    }
    setSaving(true);
    try {
      await api.post(`/books/${details.id}/reviews`, { note, commentaire: commentaire || null });
      toast.success(details.my_review ? t('updated') : t('thanks'));
      onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success(t('deleted'));
      onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    }
  };

  const reviews = details.reviews ?? [];
  const dateFormat = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR', { dateStyle: 'medium' });

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-stone-900 text-sm">
          {t('title')} <span className="text-stone-400 font-normal">({reviews.length})</span>
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Stars value={Math.round(details.note_moyenne)} size={14} />
            <span className="font-semibold text-stone-700">{Number(details.note_moyenne).toFixed(1)}</span>
          </div>
        )}
      </div>

      {details.can_review && (
        <form onSubmit={submit} className="bg-cream border border-stone-200 rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-stone-700">
              {details.my_review ? t('your_review') : t('leave_review')}
            </span>
            <Stars value={note} onChange={setNote} size={20} />
          </div>
          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={t('comment_placeholder')}
            maxLength={1000}
            rows={2}
            className="bg-white"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="sm" className="bg-brand-600 hover:bg-brand-700 rounded-xl">
              {saving ? <Loader2 size={14} className="animate-spin" /> : details.my_review ? t('update') : t('publish')}
            </Button>
          </div>
        </form>
      )}

      {!details.can_review && user && (
        <p className="text-xs text-stone-500 mb-4">{t('borrow_first')}</p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-stone-500">{t('none')}</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-stone-100 pb-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-stone-900 truncate">
                    {r.user ? `${r.user.prenom} ${r.user.nom?.[0] ?? ''}.` : t('anonymous')}
                  </span>
                  <Stars value={r.note} size={12} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <time className="text-xs text-stone-400">{dateFormat.format(new Date(r.created_at))}</time>
                  {(r.user_id === user?.id || isAdmin) && (
                    <button type="button" onClick={() => remove(r.id)} aria-label={t('delete')} className="text-stone-400 hover:text-coral-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {r.commentaire && <p className="text-sm text-stone-600 mt-1 leading-relaxed">{r.commentaire}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
