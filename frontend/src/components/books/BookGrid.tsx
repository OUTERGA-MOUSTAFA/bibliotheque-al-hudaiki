import BookCard from './BookCard';
import type { Book } from '@/types';

export default function BookGrid({ books }: { books: Book[] }) {
  if (!books.length) {
    return (
      <div className="text-center py-16 text-stone-500">
        Aucun livre trouvé
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}