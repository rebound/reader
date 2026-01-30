import { useState, useEffect } from 'react';
import { Library } from './library';
import { Reader } from './reader';
import { useBooks } from '../hooks/use-books';
import { useSettings } from '../hooks/use-settings';

export function App() {
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const { books, loading, importBook, removeBook, fetchBook } = useBooks();
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleOpenBook = (bookId: number) => {
    setCurrentBookId(bookId);
  };

  const handleCloseBook = () => {
    setCurrentBookId(null);
  };

  if (currentBookId) {
    return (
      <Reader
        bookId={currentBookId}
        fetchBook={fetchBook}
        onClose={handleCloseBook}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    );
  }

  return (
    <Library
      books={books}
      loading={loading}
      onImport={importBook}
      onOpen={handleOpenBook}
      onDelete={removeBook}
      settings={settings}
      onUpdateSetting={updateSetting}
    />
  );
}
