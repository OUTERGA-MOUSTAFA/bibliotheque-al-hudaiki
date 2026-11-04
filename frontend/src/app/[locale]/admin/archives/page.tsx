'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import type { Book } from '@/types';
import BookDetailsModal from '@/components/admin/BookDetailsModal';

export default function AdminArchivesPage() {
    const t = useTranslations('admin');
    const tBook = useTranslations('book');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const fetchArchivedBooks = useCallback(() => {
        api.get('/admin/books', { params: { statut: 'archive', per_page: 50 } })
            .then(({ data }) => setBooks(data.data || []))
            .catch((err) => toast.error(apiErrorMessage(err, t('load_books_error'))))
            .finally(() => setLoading(false));
    }, [t]);

    useEffect(() => { fetchArchivedBooks(); }, [fetchArchivedBooks]);

    const handleRestore = async (id: number) => {
        if (!confirm(t('confirm_restore_book'))) return;
        try {
            await api.post(`/admin/books/${id}/restore`);
            toast.success(t('book_restored'));
            fetchArchivedBooks();
        } catch (err) {
            toast.error(apiErrorMessage(err, t('save_error')));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-stone-900">{t('archived_books')} ({books.length})</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-stone-200 overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-sand border-b border-stone-200">
                        <tr>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('book')}</th>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('stock')}</th>
                            <th className="text-start p-4 text-xs font-bold text-stone-600 uppercase">{t('status')}</th>
                            <th className="text-end p-4 text-xs font-bold text-stone-600 uppercase">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand-600" /></td></tr>
                        ) : books.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8 text-stone-500">{t('no_archived_books')}</td></tr>
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
                                            {tBook(`status.${book.statut}`)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRestore(book.id); }}
                                            className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
                                            title={t('restore')}
                                            aria-label={t('restore')}
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
