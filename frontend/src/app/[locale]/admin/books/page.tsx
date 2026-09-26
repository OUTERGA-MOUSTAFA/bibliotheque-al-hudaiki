'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Loader2, BookOpen, Trash2, Archive, Edit, BookMarked } from 'lucide-react';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = () => {
    api.get('/books', { params: { per_page: 50 } })
      .then(({ data }) => setBooks(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooks(); }, []);

  const archiveBook = async (id: number) => {
    if (!confirm('أرشفة هذا الكتاب؟')) return;
    try {
      await api.post(`/admin/books/${id}/archive`);
      fetchBooks();
    } catch (err) { alert('خطأ'); }
  };

  const deleteBook = async (id: number) => {
    if (!confirm('حذف نهائي؟')) return;
    try {
      await api.delete(`/admin/books/${id}`);
      fetchBooks();
    } catch (err) { alert('خطأ'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-900">الكتب ({books.length})</h1>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
          + إضافة كتاب
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-sand border-b border-stone-200">
            <tr>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">الكتاب</th>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">المخزون</th>
              <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">الحالة</th>
              <th className="text-end p-4 text-xs font-bold text-stone-600 uppercase">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-stone-100 hover:bg-sand/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg bg-sand overflow-hidden shrink-0">
                      {book.image && (
                        <Image src={book.image} alt={book.titre} width={48} height={64} className="object-cover w-full h-full" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{book.titre}</div>
                      <div className="text-xs text-stone-500">{book.categorie?.nom}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm">{book.stock}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    book.statut === 'disponible' ? 'bg-brand-50 text-brand-700'
                    : book.statut === 'emprunte' ? 'bg-coral-50 text-coral-700'
                    : 'bg-stone-100 text-stone-600'
                  }`}>
                    {book.statut}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => archiveBook(book.id)}
                      className="p-2 rounded-lg hover:bg-gold-50 text-gold-600 transition"
                      title="أرشفة"
                    >
                      <Archive size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition" title="تعديل">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="p-2 rounded-lg hover:bg-coral-50 text-coral-600 transition"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!books.length && (
          <div className="text-center py-12 text-stone-500">لا توجد كتب</div>
        )}
      </div>
    </div>
  );
}
