'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X, Edit, Archive, Trash2, Save, Loader2, RotateCcw } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Book } from '@/types';

// Champs modifiables ici. On n'envoie pas tout l'objet livre : l'API refusait la requête
// (champ « image » = URL alors qu'elle attend un fichier)
type EditForm = {
    titre: string;
    stock: number;
    nombre_pages: number | null;
    max_borrow_days: number;
    age_restriction: number | null;
    description: string;
    resume: string;
};

const toForm = (b: Book): EditForm => ({
    titre: b.titre,
    stock: b.stock,
    nombre_pages: b.nombre_pages ?? null,
    max_borrow_days: b.max_borrow_days ?? 14,
    age_restriction: b.age_restriction ?? null,
    description: b.description ?? '',
    resume: b.resume ?? '',
});

const numberOrNull = (v: string) => (v === '' ? null : Number(v));

export default function BookDetailsModal({
    book,
    isOpen,
    onClose,
    onRefresh,
}: {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const t = useTranslations('admin');
    const tBook = useTranslations('book');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<EditForm | null>(null);

    if (!isOpen || !book) return null;

    const close = () => {
        setIsEditing(false);
        onClose();
    };

    const run = async (action: () => Promise<unknown>, success: string, fallbackError: string) => {
        setLoading(true);
        try {
            await action();
            toast.success(success);
            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (err) {
            toast.error(apiErrorMessage(err, fallbackError));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => form && run(() => api.put(`/admin/books/${book.id}`, form), t('book_updated'), t('save_error'));
    const handleArchive = () => confirm(t('confirm_archive_book')) && run(() => api.post(`/admin/books/${book.id}/archive`), t('book_archived'), t('save_error'));
    const handleDelete = () => confirm(t('confirm_delete_book')) && run(() => api.delete(`/admin/books/${book.id}`), t('book_deleted'), t('delete_error'));
    const handleRestore = () => confirm(t('confirm_restore_book')) && run(() => api.post(`/admin/books/${book.id}/restore`), t('book_restored'), t('save_error'));

    const field = 'w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={close}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

                <div className="flex justify-between items-center p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{isEditing ? t('edit_book') : t('book_details')}</h2>
                    <button onClick={close} className="p-2 hover:bg-stone-100 rounded-full transition" aria-label={t('cancel')}><X size={20} /></button>
                </div>

                <div className="p-6">
                    {isEditing && form ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="edit-titre" className="text-sm font-semibold">{t('book_title')}</label>
                                <Input id="edit-titre" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="edit-stock" className="text-sm font-semibold">{t('stock')}</label>
                                    <Input id="edit-stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="edit-pages" className="text-sm font-semibold">{t('pages')}</label>
                                    <Input id="edit-pages" type="number" min={1} value={form.nombre_pages ?? ''} onChange={(e) => setForm({ ...form, nombre_pages: numberOrNull(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="edit-max" className="text-sm font-semibold">{t('max_borrow_days')}</label>
                                    <Input id="edit-max" type="number" min={1} max={365} value={form.max_borrow_days} onChange={(e) => setForm({ ...form, max_borrow_days: Number(e.target.value) || 14 })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="edit-age" className="text-sm font-semibold">{t('min_age')}</label>
                                    <Input id="edit-age" type="number" min={0} max={120} placeholder={t('age_placeholder')} value={form.age_restriction ?? ''} onChange={(e) => setForm({ ...form, age_restriction: numberOrNull(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-desc" className="text-sm font-semibold">{t('description')}</label>
                                <textarea id="edit-desc" className={field} rows={3} maxLength={555} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-resume" className="text-sm font-semibold">{t('summary')}</label>
                                <textarea id="edit-resume" className={field} rows={4} maxLength={1200} value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
                                <Button onClick={handleSave} disabled={loading || !form.titre.trim()} className="bg-brand-600 text-white">
                                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="me-2" /> {t('save')}</>}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-xl overflow-hidden bg-stone-100 shrink-0">
                                    {book.image && <Image src={book.image} alt={book.titre} fill className="object-cover" />}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-stone-900">{book.titre}</h3>
                                        <p className="text-sm text-brand-600 font-semibold">{book.categorie?.nom || tBook('no_category')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-4 rounded-xl">
                                        <div>
                                            <span className="text-stone-500 block">{t('status')}</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${book.statut === 'disponible' ? 'bg-brand-100 text-brand-700' : book.statut === 'archive' ? 'bg-stone-200 text-stone-600' : 'bg-coral-100 text-coral-700'}`}>
                                                {tBook(`status.${book.statut}`)}
                                            </span>
                                        </div>
                                        <div><span className="text-stone-500 block">{t('stock')}</span> <span className="font-bold">{book.stock}</span></div>
                                        <div><span className="text-stone-500 block">{t('pages')}</span> <span className="font-bold">{book.nombre_pages || '—'}</span></div>
                                        <div><span className="text-stone-500 block">{t('language')}</span> <span className="font-bold">{tBook.has(`languages.${book.langue}`) ? tBook(`languages.${book.langue}`) : book.langue}</span></div>
                                        <div><span className="text-stone-500 block">{t('max_borrow_days')}</span> <span className="font-bold">{book.max_borrow_days}</span></div>
                                        <div><span className="text-stone-500 block">{t('min_age')}</span> <span className="font-bold">{book.age_restriction || '—'}</span></div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-stone-900 text-sm mb-1">{t('description')}</h4>
                                        <p className="text-sm text-stone-600 line-clamp-3">{book.description || t('not_provided')}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">{t('full_summary')}</h4>
                                <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl">{book.resume || t('not_provided')}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-6 border-t border-stone-100">
                                <Button onClick={() => { setForm(toForm(book)); setIsEditing(true); }} className="bg-sky-600 hover:bg-sky-700 text-white">
                                    <Edit size={16} className="me-2" /> {t('edit')}
                                </Button>

                                {book.statut === 'archive' ? (
                                    <>
                                        <Button onClick={handleRestore} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white">
                                            <RotateCcw size={16} className="me-2" /> {t('restore')}
                                        </Button>
                                        <Button onClick={handleDelete} disabled={loading} className="bg-coral-600 hover:bg-coral-700 text-white">
                                            <Trash2 size={16} className="me-2" /> {t('delete')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={handleArchive} disabled={loading} className="bg-gold-500 hover:bg-gold-600 text-white">
                                        <Archive size={16} className="me-2" /> {t('archive')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
