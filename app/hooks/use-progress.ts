import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/utilities/db.ts'

export function useProgress(bookId: number | undefined) {
  const progress = useLiveQuery(
    () => (bookId ? db.progress.where('bookId').equals(bookId).first() : undefined),
    [bookId],
  )

  const updateProgress = async (location: string, percentage: number): Promise<void> => {
    if (!bookId) return

    // Delete any existing progress for this book, then add the new value
    await db.progress.where('bookId').equals(bookId).delete()
    await db.progress.add({
      bookId,
      location,
      percentage,
      updatedAt: Date.now(),
    })
  }

  return {
    progress: progress,
    updateProgress,
  }
}
