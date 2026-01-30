import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { BookOpen, Upload, Moon, Sun, Coffee } from 'lucide-react';
import { BookCard } from './book-card';
import { Spinner } from './spinner';
import { DropZone } from './drop-zone';
import type { Book } from '../utils/db';
import type { Settings, Theme } from '../hooks/use-settings';

interface LibraryProps {
  books: Book[];
  loading: boolean;
  onImport: (file: File) => Promise<number>;
  onOpen: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  settings: Settings;
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

export function Library({
  books,
  loading,
  onImport,
  onOpen,
  onDelete,
  settings,
  onUpdateSetting,
}: LibraryProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setImporting(true);
      setError(null);

      try {
        for (const file of Array.from(files)) {
          await onImport(file);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to import');
      } finally {
        setImporting(false);
      }
    },
    [onImport]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'sepia', 'dark'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onUpdateSetting('theme', themes[nextIndex]);
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'sepia' ? Coffee : Sun;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
            <h1 className="text-2xl font-serif font-semibold">Reader</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              title={`Theme: ${settings.theme}`}
            >
              <ThemeIcon className="w-5 h-5" />
            </button>

            <label
              className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-black/5"
              style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Import</span>
              <input
                type="file"
                accept=".epub,.pdf"
                multiple
                onChange={handleInputChange}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : books.length === 0 ? (
          <DropZone
            isActive={dragActive}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="p-16 text-center"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-40" />
            <h2 className="text-xl font-serif mb-2">Your library is empty</h2>
            <p className="opacity-60 mb-6">
              Drag and drop EPUB or PDF files here, or click Import above
            </p>
            {importing && (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                <span>Importing...</span>
              </div>
            )}
          </DropZone>
        ) : (
          <>
            <DropZone
              isActive={dragActive}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="p-8 mb-8 text-center"
            >
              <p className="opacity-60">
                {importing ? 'Importing...' : 'Drop files here to add to your library'}
              </p>
            </DropZone>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onOpen={() => book.id && onOpen(book.id)}
                  onDelete={() => book.id && onDelete(book.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 text-center opacity-50 text-sm">
          100% offline • No accounts • Your books stay on your device
        </div>
      </footer>
    </div>
  );
}
