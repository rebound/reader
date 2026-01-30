import { useState, useEffect, useCallback } from 'react';
import { saveProgress, getProgress, type Progress } from '../utils/db';

export interface UseProgressReturn {
  progress: Progress | null;
  loading: boolean;
  updateProgress: (location: string, percentage: number) => Promise<void>;
}

export function useProgress(bookId: number | undefined): UseProgressReturn {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;

    const load = async () => {
      setLoading(true);
      try {
        const saved = await getProgress(bookId);
        setProgress(saved ?? null);
      } catch (e) {
        console.error('Failed to load progress:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookId]);

  const updateProgress = useCallback(
    async (location: string, percentage: number): Promise<void> => {
      if (!bookId) return;

      try {
        await saveProgress(bookId, location, percentage);
        setProgress({ bookId, location, percentage, updatedAt: Date.now() });
      } catch (e) {
        console.error('Failed to save progress:', e);
      }
    },
    [bookId]
  );

  return {
    progress,
    loading,
    updateProgress,
  };
}
