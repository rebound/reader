import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/utilities/db.ts'

export function useBookmarks(bookId: number | undefined) {
  const bookmarks = useLiveQuery(() => (bookId ? db.bookmarks.where('bookId').equals(bookId).toArray() : []), [bookId])

  const createBookmark = async (location: string, label: string): Promise<number | undefined> => {
    if (!bookId) return undefined

    const id = await db.bookmarks.add({
      bookId,
      location,
      label,
      createdAt: Date.now(),
    })

    return id as number
  }

  const removeBookmark = async (id: number): Promise<void> => {
    await db.bookmarks.delete(id)
  }

  return {
    bookmarks: bookmarks ?? [],
    createBookmark,
    removeBookmark,
  }
}
