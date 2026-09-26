'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BookGrid from '@/components/books/BookGrid';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Book } from '@/types';

export default function FavoritesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites')
      .then(({ data }) => setBooks(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">❤️ مفضلتي / Mes favoris</h1>
        {loading ? (
          <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>
        ) : books.length ? (
          <BookGrid books={books} />
        ) : (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">لا توجد كتب في المفضلة</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}