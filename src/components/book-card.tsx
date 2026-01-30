import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { Trash2, FileText, BookOpen } from 'lucide-react';
import type { Book } from '../utils/db';

interface BookCardProps {
  book: Book;
  onOpen: () => void;
  onDelete: () => void;
}

export function BookCard({ book, onOpen, onDelete }: BookCardProps) {
  const [showDelete, setShowDelete] = useState(false);

  const coverUrl = useMemo(() => {
    return book.cover ? URL.createObjectURL(book.cover) : null;
  }, [book.cover]);

  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    };
  }, [coverUrl]);

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${book.title}"?`)) {
      onDelete();
    }
  };

  const TypeIcon = book.type === 'epub' ? BookOpen : FileText;

  return (
    <div
      className="relative cursor-pointer group rounded-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      onClick={onOpen}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Cover */}
      <div
        className="aspect-2/3 rounded-lg overflow-hidden mb-3 shadow-md"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <TypeIcon className="w-12 h-12 mb-2 opacity-30" />
            <span className="text-xs uppercase tracking-wide opacity-40">{book.type}</span>
          </div>
        )}

        {/* Delete button */}
        {showDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Delete book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-serif font-medium text-sm leading-tight line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-xs opacity-60 line-clamp-1">{book.author}</p>
      </div>
    </div>
  );
}
