'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Book } from '@/types';
import BookDetailsModal from '@/components/admin/BookDetailsModal';

export default function AdminArchivesPage() {
    const t = useTranslations('admin');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const fetchArchivedBooks = useCallback(() => {
        api.get('/books', { params: { statut: 'archive', per_page: 50 } })
            .then(({ data }) => setBooks(data.data || []))
            .catch((err) => toast.error("Erreur de chargement des archives"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchArchivedBooks(); }, [fetchArchivedBooks]);
    const handleRestore = async (id: number) => {
        if (!confirm("Réactiver ce livre ?")) return;
        try {
            await api.post(`/admin/books/${id}/restore`);
            toast.success("Livre réactivé");
            fetchArchivedBooks();
        } catch (err) {
            toast.error("Erreur de réactivation");
        }
    };
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-stone-900">الأرشيف ({books.length})</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-sand border-b border-stone-200">
                        <tr>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">Livre</th>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">Stock</th>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">Statut</th>
                            <th className="text-end p-4 text-xs font-bold text-stone-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand-600" /></td></tr>
                        ) : books.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-8 text-stone-500">Aucun livre archivé</td></tr>
                        ) : (
                            books.map((book) => (
                                <tr
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                    className="border-b border-stone-100 hover:bg-sand/50 cursor-pointer transition"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-14 rounded bg-stone-100 overflow-hidden shrink-0">
                                                {book.image && <Image src={book.image} alt={book.titre} width={40} height={56} className="object-cover w-full h-full" />}
                                            </div>
                                            <div className="font-semibold text-sm line-clamp-1">{book.titre}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium">{book.stock}</td>
                                    <td className="p-4">
                                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-stone-200 text-stone-600">
                                            {book.statut}
                                        </span>
                                    </td>
                                    {/* 👇 Zid had l'kolon dial l'action */}
                                    <td className="p-4 text-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRestore(book.id); }}
                                            className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
                                            title="Réactiver le livre"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <BookDetailsModal
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                onRefresh={fetchArchivedBooks}
            />
        </div>
    );
}