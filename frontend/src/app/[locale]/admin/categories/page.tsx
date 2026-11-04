'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Pencil, Trash2, Plus, Archive, RotateCcw, Tags } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category } from '@/types';

type FormState = { nom: string; description: string };
const EMPTY: FormState = { nom: '', description: '' };

export default function AdminCategoriesPage() {
  const t = useTranslations('admin');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const fetchCategories = useCallback(() => {
    api.get<Category[]>('/admin/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(apiErrorMessage(err, t('load_error'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openForm = (category: Category | null) => {
    setEditing(category);
    setForm(category ? { nom: category.nom, description: category.description ?? '' } : EMPTY);
    setIsFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { nom: form.nom, description: form.description || null };
      if (editing) await api.put(`/admin/categories/${editing.id}`, payload);
      else await api.post('/admin/categories', payload);
      toast.success(t('saved'));
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (category: Category) => {
    const archived = category.statut === 'archive';
    try {
      await api.post(`/admin/categories/${category.id}/${archived ? 'restore' : 'archive'}`);
      toast.success(archived ? t('category_restored') : t('category_archived'));
      fetchCategories();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    }
  };

  const remove = async (category: Category) => {
    if (!confirm(t('confirm_delete_category', { count: category.books_count ?? 0 }))) return;
    try {
      await api.delete(`/admin/categories/${category.id}`);
      toast.success(t('deleted'));
      fetchCategories();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('delete_error')));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('categories')}</h1>
          <p className="text-stone-500 text-sm">{t('categories_hint')}</p>
        </div>
        <Button onClick={() => openForm(null)} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
          <Plus size={16} /> {t('new_category')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          <Tags className="mx-auto mb-3 text-stone-300" size={40} />
          {t('no_categories')}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand border-b border-stone-200 text-stone-600">
              <tr>
                <th className="text-start font-semibold px-4 py-3">{t('category_name')}</th>
                <th className="text-start font-semibold px-4 py-3">{t('books')}</th>
                <th className="text-start font-semibold px-4 py-3">{t('status')}</th>
                <th className="text-end font-semibold px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((c) => {
                const archived = c.statut === 'archive';
                return (
                  <tr key={c.id} className={archived ? 'bg-stone-50 text-stone-500' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{c.nom}</div>
                      {c.description && <div className="text-xs text-stone-500 line-clamp-1">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3">{c.books_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${archived ? 'bg-stone-200 text-stone-600' : 'bg-brand-50 text-brand-700'}`}>
                        {archived ? t('status_archived') : t('status_active')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openForm(c)} className="p-2 rounded-lg hover:bg-sand text-stone-600" title={t('edit')} aria-label={t('edit')}>
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => toggleArchive(c)}
                          className="p-2 rounded-lg hover:bg-gold-50 text-gold-700"
                          title={archived ? t('restore') : t('archive')}
                          aria-label={archived ? t('restore') : t('archive')}
                        >
                          {archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                        </button>
                        <button onClick={() => remove(c)} className="p-2 rounded-lg hover:bg-coral-50 text-coral-600" title={t('delete')} aria-label={t('delete')}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-stone-900">{editing ? t('edit_category') : t('new_category')}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="cat-nom">{t('category_name')} *</Label>
              <Input id="cat-nom" required maxLength={255} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">{t('description')}</Label>
              <textarea
                id="cat-desc"
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
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
