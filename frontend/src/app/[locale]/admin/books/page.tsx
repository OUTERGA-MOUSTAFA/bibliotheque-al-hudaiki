'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Loader2, Trash2, Archive, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Book, Category } from '@/types';
import BookDetailsModal from '@/components/admin/BookDetailsModal';

const EMPTY_FORM = {
  titre: '',
  description: '',
  resume: '',
  nombre_pages: '',
  langue: 'ar',
  stock: 1,
  categorie_id: '',
  max_borrow_days: 14,
  age_restriction: '',
};

export default function AdminBooksPage() {
  const t = useTranslations('admin');
  const tBook = useTranslations('book');

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Livres non archivés (les archivés sont dans la page Archives)
  const fetchBooks = useCallback(() => {
    api.get('/books', { params: { per_page: 50 } })
      .then(({ data }) => setBooks(data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, t('load_books_error'))))
      .finally(() => setLoading(false));
  }, [t]);

  const fetchCategories = useCallback(() => {
    api.get('/admin/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : (data.data || [])))
      .catch((err) => toast.error(apiErrorMessage(err, t('load_categories_error'))));
  }, [t]);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [fetchBooks, fetchCategories]);

  // Envoi multipart : la couverture part sur Cloudinary côté API
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const data = new FormData();
      data.append('titre', formData.titre);
      if (formData.description) data.append('description', formData.description);
      if (formData.resume) data.append('resume', formData.resume);
      if (formData.nombre_pages) data.append('nombre_pages', formData.nombre_pages);
      data.append('langue', formData.langue);
      data.append('stock', formData.stock.toString());
      data.append('max_borrow_days', formData.max_borrow_days.toString());
      if (formData.age_restriction) data.append('age_restriction', formData.age_restriction);
      if (formData.categorie_id) data.append('categorie_id', formData.categorie_id);
      if (imageFile) data.append('image', imageFile);

      await api.post('/admin/books', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(t('book_added'));
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setImageFile(null);
      setLoading(true);
      fetchBooks();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('save_error')));
    } finally {
      setFormLoading(false);
    }
  };

  const archiveBook = async (id: number) => {
    if (!confirm(t('confirm_archive_book'))) return;
    try {
      await api.post(`/admin/books/${id}/archive`);
      fetchBooks();
      toast.success(t('book_archived'));
    } catch (err) { toast.error(apiErrorMessage(err, t('save_error'))); }
  };

  const deleteBook = async (id: number) => {
    if (!confirm(t('confirm_delete_book'))) return;
    try {
      await api.delete(`/admin/books/${id}`);
      fetchBooks();
      toast.success(t('book_deleted'));
    } catch (err) { toast.error(apiErrorMessage(err, t('delete_error'))); }
  };

  const selectClass = 'w-full h-10 px-3 border border-stone-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
  const textareaClass = 'w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-stone-900">{t('books')} ({books.length})</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6">
          {t('add_book')}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sand border-b border-stone-200">
            <tr>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('book_title')}</th>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('stock')}</th>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('status')}</th>
              <th className="text-end p-4 text-xs font-bold text-stone-600 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand-600" /></td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-stone-500">{t('no_books')}</td></tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} onClick={() => setSelectedBook(book)} className="border-b border-stone-100 hover:bg-sand/50 transition cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-stone-100 overflow-hidden shrink-0">
                        {book.image && <Image src={book.image} alt={book.titre} width={40} height={56} className="object-cover w-full h-full" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm line-clamp-1">{book.titre}</div>
                        <div className="text-xs text-stone-500">{book.categorie?.nom || tBook('no_category')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{book.stock}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${book.statut === 'disponible' ? 'bg-brand-50 text-brand-700' : 'bg-coral-50 text-coral-700'}`}>
                      {tBook(`status.${book.statut}`)}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* stopPropagation : ces boutons ne doivent pas ouvrir la fiche du livre */}
                    <div className="flex gap-2 justify-end">
                      <button onClick={(e) => { e.stopPropagation(); archiveBook(book.id); }} className="p-2 rounded-lg hover:bg-gold-50 text-gold-600 transition" title={t('archive')} aria-label={t('archive')}>
                        <Archive size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }} className="p-2 rounded-lg hover:bg-coral-50 text-coral-600 transition" title={t('delete')} aria-label={t('delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BookDetailsModal book={selectedBook} isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} onRefresh={fetchBooks} />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="text-2xl font-bold mb-6">{t('new_book')}</h2>

            <form onSubmit={handleAddBook} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-titre">{t('book_title')} *</Label>
                <Input id="new-titre" required value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} placeholder={t('title_placeholder')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-cat">{t('category')}</Label>
                  <select id="new-cat" className={selectClass} value={formData.categorie_id} onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}>
                    <option value="">{t('no_category')}</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-lang">{t('language')}</Label>
                  <select id="new-lang" className={selectClass} value={formData.langue} onChange={(e) => setFormData({ ...formData, langue: e.target.value })}>
                    {(['ar', 'fr', 'en'] as const).map((l) => <option key={l} value={l}>{tBook(`languages.${l}`)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pages">{t('pages')}</Label>
                  <Input id="new-pages" type="number" min={1} value={formData.nombre_pages} onChange={(e) => setFormData({ ...formData, nombre_pages: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-stock">{t('stock')} *</Label>
                  <Input id="new-stock" type="number" required min={0} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-desc">{t('description')}</Label>
                <textarea id="new-desc" className={textareaClass} rows={2} maxLength={555} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-resume">{t('summary')}</Label>
                <textarea id="new-resume" className={textareaClass} rows={4} maxLength={1200} value={formData.resume} onChange={(e) => setFormData({ ...formData, resume: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>{t('cover_image')}</Label>
                <label className="cursor-pointer bg-stone-50 hover:bg-stone-100 border-2 border-stone-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center w-full transition mt-1">
                  <ImageIcon className="text-stone-400 mb-2" size={28} />
                  <span className="text-sm font-medium text-stone-600">{imageFile ? imageFile.name : t('click_upload')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-max">{t('max_borrow_days')} *</Label>
                  <Input id="new-max" type="number" required min={1} max={365} value={formData.max_borrow_days} onChange={(e) => setFormData({ ...formData, max_borrow_days: parseInt(e.target.value) || 14 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-age">{t('min_age')}</Label>
                  <Input id="new-age" type="number" min={0} max={120} placeholder={t('age_placeholder')} value={formData.age_restriction} onChange={(e) => setFormData({ ...formData, age_restriction: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
                <Button type="submit" disabled={formLoading} className="bg-brand-600 hover:bg-brand-700 text-white min-w-[120px]">
                  {formLoading ? <Loader2 className="animate-spin" size={18} /> : t('save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
