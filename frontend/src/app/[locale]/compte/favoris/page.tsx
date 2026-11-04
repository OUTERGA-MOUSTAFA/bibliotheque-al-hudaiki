'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import BookGrid from '@/components/books/BookGrid';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Book } from '@/types';

export default function FavoritesPage() {
  const t = useTranslations('account');
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
        <h1 className="text-3xl font-bold text-stone-900 mb-8">❤️ {t('favorites_title')}</h1>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>
        ) : books.length ? (
          <BookGrid books={books} />
        ) : (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">{t('no_favorites')}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
