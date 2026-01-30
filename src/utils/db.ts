import Dexie, { type Table } from 'dexie';

// Type definitions
export interface Book {
  id?: number;
  title: string;
  author: string;
  type: 'epub' | 'pdf';
  fileData: ArrayBuffer;
  cover: Blob | null;
  pageCount?: number;
  addedAt: number;
}

export interface Progress {
  bookId: number;
  location: string;
  percentage: number;
  updatedAt: number;
}

export interface Bookmark {
  id?: number;
  bookId: number;
  location: string;
  label: string;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

// Database class
class ReaderDB extends Dexie {
  books!: Table<Book, number>;
  progress!: Table<Progress, number>;
  bookmarks!: Table<Bookmark, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('ReaderDB');
    this.version(1).stores({
      books: '++id, title, author, type, addedAt',
      progress: 'bookId, location, percentage, updatedAt',
      bookmarks: '++id, bookId, location, label, createdAt',
      settings: 'key',
    });
  }
}

export const db = new ReaderDB();

// Book operations
export async function addBook(bookData: Omit<Book, 'id' | 'addedAt'>): Promise<number> {
  const id = await db.books.add({
    ...bookData,
    addedAt: Date.now(),
  });
  return id;
}

export async function getBook(id: number): Promise<Book | undefined> {
  return db.books.get(id);
}

export async function getAllBooks(): Promise<Book[]> {
  return db.books.orderBy('addedAt').reverse().toArray();
}

export async function deleteBook(id: number): Promise<void> {
  await db.transaction('rw', [db.books, db.progress, db.bookmarks], async () => {
    await db.books.delete(id);
    await db.progress.where('bookId').equals(id).delete();
    await db.bookmarks.where('bookId').equals(id).delete();
  });
}

// Progress operations
export async function saveProgress(
  bookId: number,
  location: string,
  percentage: number
): Promise<void> {
  await db.progress.put({
    bookId,
    location,
    percentage,
    updatedAt: Date.now(),
  });
}

export async function getProgress(bookId: number): Promise<Progress | undefined> {
  return db.progress.get(bookId);
}

// Bookmark operations
export async function addBookmark(
  bookId: number,
  location: string,
  label: string = ''
): Promise<number> {
  const id = await db.bookmarks.add({
    bookId,
    location,
    label,
    createdAt: Date.now(),
  });
  return id;
}

export async function getBookmarks(bookId: number): Promise<Bookmark[]> {
  return db.bookmarks.where('bookId').equals(bookId).toArray();
}

export async function deleteBookmark(id: number): Promise<void> {
  await db.bookmarks.delete(id);
}

// Settings operations
export async function saveSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const setting = await db.settings.get(key);
  return (setting?.value as T) ?? defaultValue;
}
