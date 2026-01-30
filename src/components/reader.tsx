import { useState, useEffect } from 'react';
import { EpubReader } from './epub-reader';
import { PdfReader } from './pdf-reader';
import type { Book } from '../utils/db';
import type { Settings } from '../hooks/use-settings';

interface ReaderProps {
  bookId: number;
  fetchBook: (id: number) => Promise<Book | undefined>;
  onClose: () => void;
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

export function Reader({ bookId, fetchBook, onClose, settings, onUpdateSetting }: ReaderProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookData = await fetchBook(bookId);
        if (!bookData) {
          throw new Error('Book not found');
        }
        setBook(bookData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId, fetchBook]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center reader-content"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--text-color)' }}>Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        className="min-h-screen flex items-center justify-center reader-content"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Book not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  if (book.type === 'epub') {
    return (
      <EpubReader
        book={book}
        onClose={onClose}
        settings={settings}
        onUpdateSetting={onUpdateSetting}
      />
    );
  }

  return (
    <PdfReader
      book={book}
      onClose={onClose}
      settings={settings}
      onUpdateSetting={onUpdateSetting}
    />
  );
}
