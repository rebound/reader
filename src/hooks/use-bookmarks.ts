import { useState, useEffect, useCallback } from 'react';
import { addBookmark, getBookmarks, deleteBookmark, type Bookmark } from '../utils/db';

export interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  loading: boolean;
  createBookmark: (location: string, label?: string) => Promise<void>;
  removeBookmark: (id: number) => Promise<void>;
}

export function useBookmarks(bookId: number | undefined): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!bookId) return;

    setLoading(true);
    try {
      const saved = await getBookmarks(bookId);
      setBookmarks(saved.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const createBookmark = useCallback(
    async (location: string, label: string = ''): Promise<void> => {
      if (!bookId) return;

      try {
        await addBookmark(bookId, location, label);
        await loadBookmarks();
      } catch (e) {
        console.error('Failed to create bookmark:', e);
      }
    },
    [bookId, loadBookmarks]
  );

  const removeBookmark = useCallback(
    async (id: number): Promise<void> => {
      try {
        await deleteBookmark(id);
        await loadBookmarks();
      } catch (e) {
        console.error('Failed to delete bookmark:', e);
      }
    },
    [loadBookmarks]
  );

  return {
    bookmarks,
    loading,
    createBookmark,
    removeBookmark,
  };
}
