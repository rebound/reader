import { Dexie } from 'dexie'
import type { Table } from 'dexie'

export type Book = {
  id?: number
  key: string
  title: string
  author: string
  type: 'epub' | 'pdf'
  fileData: ArrayBuffer
  cover: Blob | null
  pageCount?: number
  addedAt: number
}

export type Progress = {
  id?: number
  bookId: number
  location: string
  percentage: number
  updatedAt: number
}

export type Bookmark = {
  id?: number
  bookId: number
  location: string
  label: string
  createdAt: number
}

export type Setting = {
  id?: number
  key: string
  value: string
}

class ReaderDatabase extends Dexie {
  books!: Table<Book>
  progress!: Table<Progress>
  bookmarks!: Table<Bookmark>
  settings!: Table<Setting>

  constructor() {
    super('ReaderDB')

    this.version(1).stores({
      books: '++id, &key, title, author, type, addedAt',
      progress: '++id, bookId, updatedAt',
      bookmarks: '++id, bookId, createdAt',
      settings: '++id, key',
    })
  }
}

export const db = new ReaderDatabase()
