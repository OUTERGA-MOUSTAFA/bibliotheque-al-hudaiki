import BookCard from './BookCard';
import type { Book } from '@/types';

export default function BookGrid({ books }: { books: Book[] }) {
  if (!books?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}