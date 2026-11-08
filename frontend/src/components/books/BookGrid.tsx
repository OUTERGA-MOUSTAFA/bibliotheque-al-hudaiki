'use client';

import { useState } from 'react';
import BookCard from './BookCard';
import PublicBookModal from './PublicBookModal';
import type { Book } from '@/types';

export default function BookGrid({ books }: { books: Book[] }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  if (!books?.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => setSelectedBook(book)}
            className="text-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
          >
            <BookCard book={book} />
          </button>
        ))}
      </div>

      <PublicBookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onRefresh={() => window.location.reload()}
      />
    </>
  );
}