import { useState, useEffect, useCallback } from 'react';
import { getAllBooks, addBook, deleteBook, getBook, type Book } from '../utils/db';
import {
  getFileType,
  extractEpubMetadata,
  extractPdfMetadata,
  blobToArrayBuffer,
} from '../utils/file-utils';

export interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  error: string | null;
  importBook: (file: File) => Promise<number>;
  removeBook: (id: number) => Promise<void>;
  fetchBook: (id: number) => Promise<Book | undefined>;
  refresh: () => Promise<void>;
}

export function useBooks(): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      setError(null);
    } catch (e) {
      setError('Failed to load books');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const importBook = useCallback(
    async (file: File): Promise<number> => {
      const type = getFileType(file);
      if (!type) {
        throw new Error('Unsupported file type. Please use EPUB or PDF files.');
      }

      const arrayBuffer = await blobToArrayBuffer(file);
      const metadata =
        type === 'epub'
          ? await extractEpubMetadata(arrayBuffer)
          : await extractPdfMetadata(arrayBuffer);

      const bookData = {
        title: metadata.title,
        author: metadata.author,
        type,
        fileData: arrayBuffer,
        cover: metadata.cover,
        pageCount: 'pageCount' in metadata ? metadata.pageCount : undefined,
      };

      const id = await addBook(bookData);
      await loadBooks();
      return id;
    },
    [loadBooks]
  );

  const removeBook = useCallback(
    async (id: number): Promise<void> => {
      await deleteBook(id);
      await loadBooks();
    },
    [loadBooks]
  );

  const fetchBook = useCallback(async (id: number): Promise<Book | undefined> => {
    return getBook(id);
  }, []);

  return {
    books,
    loading,
    error,
    importBook,
    removeBook,
    fetchBook,
    refresh: loadBooks,
  };
}
