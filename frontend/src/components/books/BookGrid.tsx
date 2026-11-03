'use client'; // 👈 Darouri

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
          <div key={book.id} onClick={() => setSelectedBook(book)} className="cursor-pointer transition-transform hover:scale-[1.02]">
            <BookCard book={book} />
          </div>
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