import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/utilities/db.ts'
import { processFile } from '@/utilities/file-helpers.ts'
import type { Book } from '@/utilities/db.ts'

const addBook = async (file: File): Promise<number> => {
  const bookData = await processFile(file)
  const id = await db.books.add(bookData)
  return id as number
}

const deleteBook = async (id: number): Promise<void> => {
  await db.transaction('rw', [db.books, db.progress, db.bookmarks], async () => {
    await db.books.delete(id)
    await db.progress.where('bookId').equals(id).delete()
    await db.bookmarks.where('bookId').equals(id).delete()
  })
}

const deleteBookByKey = async (key: string): Promise<void> => {
  const book = await db.books.where('key').equals(key).first()
  if (book?.id) {
    await deleteBook(book.id)
  }
}

const getBook = async (id: number): Promise<Book | undefined> => {
  return db.books.get(id)
}

const getBookByKey = async (key: string): Promise<Book | undefined> => {
  return db.books.where('key').equals(key).first()
}

const updateBook = async (id: number, changes: Partial<Pick<Book, 'title' | 'author'>>): Promise<void> => {
  await db.books.update(id, changes)
}

export function useBooks() {
  const books = useLiveQuery(() => db.books.orderBy('addedAt').reverse().toArray(), [])

  return {
    books: books ?? [],
    loading: books === undefined,
    addBook,
    deleteBook,
    deleteBookByKey,
    getBook,
    getBookByKey,
    updateBook,
  }
}
