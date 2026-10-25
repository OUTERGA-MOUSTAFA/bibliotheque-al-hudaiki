'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Loader2, Trash2, Archive, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminBooksPage() {
  const t = useTranslations('admin');

  // States dial l'Liste
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Bach n3mro l'Select dial l'Categories
  const [loading, setLoading] = useState(true);

  // States dial l'Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State dial l'Form Data
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    resume: '',
    nombre_pages: '',
    langue: 'ar',
    stock: 1,
    categorie_id: ''
  });

  // 👇 1. Jib l'Books w l'Categories mlli t-charge l'page
  // 👇 1. Jib l'Books w l'Categories
  const fetchBooks = () => {
    // 👇 7yedna setLoading(true) mn hna
    api.get('/books', { params: { per_page: 50 } })
      .then(({ data }) => setBooks(data.data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Erreur de chargement des livres");
      })
      .finally(() => setLoading(false)); // 👈 Hadi mzyana 7it kat-dir f Promise
  };

  const fetchCategories = () => {
    api.get('/categories')
      .then(({ data }) => setCategories(data || []))
      .catch((err) => console.error("Erreur categories:", err));
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // 👇 2. L'Fonction dial l'Ajout (M3a Cloudinary Image)
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

      // Ila khtar categorie
      if (formData.categorie_id) {
        data.append('categorie_id', formData.categorie_id);
      }

      // Ila khtar image
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Sifet l'API
      await api.post('/admin/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Livre ajouté avec succès !");
      setIsModalOpen(false);
      // Nfirgho l'form
      setFormData({ titre: '', description: '', resume: '', nombre_pages: '', langue: 'ar', stock: 1, categorie_id: '' });
      setImageFile(null); 
      
      setLoading(true); // 👈 Zid hadi hna
      fetchBooks(); 

      fetchBooks(); // N3awdo n-jibdo l'books
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setFormLoading(false);
    }
  };

  // 👇 3. Actions (Archiver & Supprimer)
  const archiveBook = async (id: number) => {
    if (!confirm(t('archive') + ' ?')) return;
    try {
      await api.post(`/admin/books/${id}/archive`);
      fetchBooks();
      toast.success("Livre archivé");
    } catch (err) { toast.error("Erreur d'archivage"); }
  };

  const deleteBook = async (id: number) => {
    if (!confirm(t('delete') + ' ?')) return;
    try {
      await api.delete(`/admin/books/${id}`);
      fetchBooks();
      toast.success("Livre supprimé");
    } catch (err) { toast.error("Erreur de suppression"); }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-900">
          {t('books')} ({books.length})
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6"
        >
          {t('add_book')}
        </Button>
      </div>

      {/* TABLEAU DIAL L'BOOKS */}
      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-hidden">
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
                <tr key={book.id} className="border-b border-stone-100 hover:bg-sand/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-stone-100 overflow-hidden shrink-0">
                        {book.image && (
                          <Image src={book.image} alt={book.titre} width={40} height={56} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm line-clamp-1">{book.titre}</div>
                        <div className="text-xs text-stone-500">{book.categorie?.nom || 'Sans catégorie'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{book.stock}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${book.statut === 'disponible' ? 'bg-brand-50 text-brand-700' : 'bg-coral-50 text-coral-700'}`}>
                      {book.statut}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => archiveBook(book.id)} className="p-2 rounded-lg hover:bg-gold-50 text-gold-600 transition" title="Archiver">
                        <Archive size={16} />
                      </button>
                      <button onClick={() => deleteBook(book.id)} className="p-2 rounded-lg hover:bg-coral-50 text-coral-600 transition" title="Supprimer">
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

      {/* 👇 MODAL DIAL L'AJOUT (NOUVEAU LIVRE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{t('new_book')}</h2>

            <form onSubmit={handleAddBook} className="space-y-5">

              {/* Titre */}
              <div className="space-y-2">
                <Label>{t('book_title')} *</Label>
                <Input
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Le Petit Prince..."
                />
              </div>

              {/* Catégorie & Langue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <select
                    className="w-full h-10 px-3 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={formData.categorie_id}
                    onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <select
                    className="w-full h-10 px-3 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={formData.langue}
                    onChange={(e) => setFormData({ ...formData, langue: e.target.value })}
                  >
                    <option value="ar">العربية</option>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Pages & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pages')}</Label>
                  <Input
                    type="number"
                    value={formData.nombre_pages}
                    onChange={(e) => setFormData({ ...formData, nombre_pages: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('stock')} *</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t('description')} (Max 555)</Label>
                <textarea
                  className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  rows={2}
                  maxLength={555}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Résumé */}
              <div className="space-y-2">
                <Label>{t('summary')} (Max 1200)</Label>
                <textarea
                  className="w-full border border-stone-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  rows={4}
                  maxLength={1200}
                  value={formData.resume}
                  onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="cursor-pointer bg-stone-50 hover:bg-stone-100 border-2 border-stone-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center w-full transition">
                    <ImageIcon className="text-stone-400 mb-2" size={28} />
                    <span className="text-sm font-medium text-stone-600">
                      {imageFile ? imageFile.name : "Cliquez pour uploader une image (Max 5MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  {t('cancel')}
                </Button>
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