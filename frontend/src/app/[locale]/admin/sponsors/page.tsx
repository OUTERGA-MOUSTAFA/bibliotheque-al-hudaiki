'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, Plus, ExternalLink, Handshake } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Sponsor } from '@/types';

type FormState = { nom: string; logo: string; lien_externe: string; ordre: string; logo_file: File | null };
const EMPTY: FormState = { nom: '', logo: '', lien_externe: '', ordre: '0', logo_file: null };

export default function AdminSponsorsPage() {
  const t = useTranslations('admin');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const fetchSponsors = useCallback(() => {
    api.get<Sponsor[]>('/sponsors')
      .then(({ data }) => setSponsors(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(apiErrorMessage(err, t('load_error'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const openForm = (sponsor: Sponsor | null) => {
    setEditing(sponsor);
    setForm(sponsor
      ? { nom: sponsor.nom, logo: sponsor.logo ?? '', lien_externe: sponsor.lien_externe ?? '', ordre: String(sponsor.ordre ?? 0), logo_file: null }
      : EMPTY);
    setIsFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // multipart pour pouvoir envoyer un fichier ; _method=PUT car PHP ne lit pas le multipart en PUT
    const data = new FormData();
    data.append('nom', form.nom);
    if (form.logo) data.append('logo', form.logo);
    if (form.lien_externe) data.append('lien_externe', form.lien_externe);
    data.append('ordre', form.ordre || '0');
    if (form.logo_file) data.append('logo_file', form.logo_file);
    if (editing) data.append('_method', 'PUT');

    try {
      await api.post(editing ? `/admin/sponsors/${editing.id}` : '/admin/sponsors', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('saved'));
      setIsFormOpen(false);
      fetchSponsors();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (sponsor: Sponsor) => {
    if (!confirm(t('confirm_delete_sponsor', { nom: sponsor.nom }))) return;
    try {
      await api.delete(`/admin/sponsors/${sponsor.id}`);
      toast.success(t('deleted'));
      fetchSponsors();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('delete_error')));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('sponsors')}</h1>
          <p className="text-stone-500 text-sm">{t('sponsors_hint')}</p>
        </div>
        <Button onClick={() => openForm(null)} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6">
          <Plus size={16} /> {t('new_sponsor')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>
      ) : sponsors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          <Handshake className="mx-auto mb-3 text-stone-300" size={40} />
          {t('no_sponsors')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sponsors.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-soft border border-stone-200 p-5 flex flex-col">
              <div className="h-20 rounded-xl bg-sand flex items-center justify-center mb-4 overflow-hidden">
                {s.logo ? (
                  <Image src={s.logo} alt={s.nom} width={140} height={64} unoptimized className="object-contain max-h-16 w-auto" />
                ) : (
                  <span className="text-stone-400 text-sm">{t('no_logo')}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-stone-900 truncate">{s.nom}</h3>
                <span className="text-xs text-stone-400 shrink-0">#{s.ordre}</span>
              </div>
              {s.lien_externe && (
                <a href={s.lien_externe} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1 truncate mb-4">
                  <ExternalLink size={12} /> {s.lien_externe}
                </a>
              )}
              <div className="flex gap-2 mt-auto pt-2">
                <button onClick={() => openForm(s)} className="flex-1 border border-stone-200 hover:bg-sand py-2 rounded-lg text-xs font-semibold text-stone-700 transition flex items-center justify-center gap-1.5">
                  <Pencil size={14} /> {t('edit')}
                </button>
                <button onClick={() => remove(s)} className="flex-1 border border-coral-200 hover:bg-coral-50 py-2 rounded-lg text-xs font-semibold text-coral-600 transition flex items-center justify-center gap-1.5">
                  <Trash2 size={14} /> {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-950/70 flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-stone-900">{editing ? t('edit_sponsor') : t('new_sponsor')}</h2>

            <div className="space-y-1.5">
              <Label htmlFor="nom">{t('sponsor_name')}</Label>
              <Input id="nom" required maxLength={255} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo_file">{t('sponsor_logo_file')}</Label>
              <Input id="logo_file" type="file" accept="image/*" onChange={(e) => setForm({ ...form, logo_file: e.target.files?.[0] ?? null })} />
              <p className="text-xs text-stone-500">{t('sponsor_logo_or_url')}</p>
              <Input id="logo" type="url" placeholder="https://…" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lien">{t('sponsor_link')}</Label>
              <Input id="lien" type="url" placeholder="https://…" value={form.lien_externe} onChange={(e) => setForm({ ...form, lien_externe: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ordre">{t('sponsor_order')}</Label>
              <Input id="ordre" type="number" min={0} value={form.ordre} onChange={(e) => setForm({ ...form, ordre: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700">
                {saving ? <Loader2 size={16} className="animate-spin" /> : t('save')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
