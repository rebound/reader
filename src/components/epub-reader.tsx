import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ePub, { type Book as EpubBook, type Rendition, type NavItem, type Location } from 'epubjs';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bookmark,
  BookmarkPlus,
  Settings,
} from 'lucide-react';
import { Sidebar, type TocItem } from './sidebar';
import { SettingsPanel } from './settings-panel';
import { ProgressBar } from './progress-bar';
import { useProgress } from '../hooks/use-progress';
import { useBookmarks } from '../hooks/use-bookmarks';
import type { Book } from '../utils/db';
import type { Settings as SettingsType } from '../hooks/use-settings';

interface EpubReaderProps {
  book: Book;
  onClose: () => void;
  settings: SettingsType;
  onUpdateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>;
}

export function EpubReader({ book, onClose, settings, onUpdateSetting }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<EpubBook | null>(null);

  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { progress, updateProgress } = useProgress(book.id);
  const { bookmarks, createBookmark, removeBookmark } = useBookmarks(book.id);

  const isCurrentPageBookmarked = useMemo(() => {
    if (!currentLocation || bookmarks.length === 0) return false;
    return bookmarks.some((bm) => bm.location === currentLocation);
  }, [currentLocation, bookmarks]);

  // Initialize epub
  useEffect(() => {
    if (!viewerRef.current || !book.fileData) return;

    // Copy ArrayBuffer - epub.js may detach the original
    const bufferCopy = book.fileData.slice(0);
    const epubBook = ePub(bufferCopy);
    bookRef.current = epubBook;

    const rendition = epubBook.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
    });

    renditionRef.current = rendition;

    // Load table of contents
    epubBook.loaded.navigation.then((nav) => {
      const tocItems: TocItem[] = nav.toc.map((item: NavItem) => ({
        label: item.label,
        href: item.href,
        subitems: item.subitems?.map((sub: NavItem) => ({
          label: sub.label,
          href: sub.href,
        })),
      }));
      setToc(tocItems);
    });

    // Handle location changes
    rendition.on('relocated', (location: Location) => {
      setCurrentLocation(location.start.cfi);
      const pct = epubBook.locations.percentageFromCfi(location.start.cfi);
      setPercentage(Math.round((pct || 0) * 100));
    });

    // Set ready when content is actually rendered
    rendition.on('rendered', () => {
      setIsReady(true);
    });

    // Generate locations for percentage tracking
    epubBook.ready
      .then(() => {
        return epubBook.locations.generate(1024);
      })
      .then(() => {
        // Restore saved position or start from beginning
        if (progress?.location) {
          return rendition.display(progress.location);
        } else {
          return rendition.display();
        }
      });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        rendition.prev();
      } else if (e.key === 'ArrowRight') {
        rendition.next();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      setIsReady(false);
      rendition.destroy();
      epubBook.destroy();
    };
  }, [book.fileData, book.id]);

  // Restore progress when loaded
  useEffect(() => {
    if (progress?.location && renditionRef.current && bookRef.current?.locations?.length()) {
      renditionRef.current.display(progress.location);
    }
  }, [progress]);

  // Apply theme to epub content
  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition || !isReady || !rendition.themes) return;

    const themes: Record<string, { body: { background: string; color: string } }> = {
      light: {
        body: {
          background: '#ffffff',
          color: '#1f2937',
        },
      },
      sepia: {
        body: {
          background: '#f4ecd8',
          color: '#433422',
        },
      },
      dark: {
        body: {
          background: '#1a1a1a',
          color: '#e5e5e5',
        },
      },
    };

    try {
      rendition.themes.register('current', themes[settings.theme]);
      rendition.themes.select('current');
      rendition.themes.fontSize(`${settings.fontSize}px`);
    } catch (e) {
      // Themes not ready yet, will retry on next render
      console.debug('Theme application deferred:', e);
    }
  }, [settings.theme, settings.fontSize, isReady]);

  // Save progress periodically
  useEffect(() => {
    if (currentLocation && percentage >= 0) {
      const timer = setTimeout(() => {
        updateProgress(currentLocation, percentage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLocation, percentage, updateProgress]);

  const goToLocation = useCallback((cfi: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(cfi);
      setShowSidebar(false);
    }
  }, []);

  const goToPrev = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  }, []);

  const goToNext = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  }, []);

  const toggleBookmark = useCallback(() => {
    if (!currentLocation) return;

    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks.find((bm) => bm.location === currentLocation);
      if (bookmark?.id) {
        removeBookmark(bookmark.id);
      }
    } else {
      createBookmark(currentLocation, `Page at ${percentage}%`);
    }
  }, [
    currentLocation,
    isCurrentPageBookmarked,
    bookmarks,
    removeBookmark,
    createBookmark,
    percentage,
  ]);

  return (
    <div
      className="h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <h1 className="font-serif text-lg truncate max-w-md" style={{ color: 'var(--text-color)' }}>
          {book.title}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleBookmark}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            title={isCurrentPageBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isCurrentPageBookmarked ? (
              <BookmarkPlus className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          show={showSidebar}
          onClose={() => setShowSidebar(false)}
          toc={toc}
          bookmarks={bookmarks}
          onNavigate={goToLocation}
          onDeleteBookmark={removeBookmark}
        />

        {/* Settings panel */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Navigation buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-0 bottom-0 w-16 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to right, var(--bg-color), transparent)' }}
        >
          <ChevronLeft className="w-8 h-8 opacity-50" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 top-0 bottom-0 w-16 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to left, var(--bg-color), transparent)' }}
        >
          <ChevronRight className="w-8 h-8 opacity-50" />
        </button>

        {/* EPUB viewer */}
        <div
          ref={viewerRef}
          className="flex-1 h-full overflow-hidden mx-auto max-w-3xl"
          style={{
            fontFamily:
              settings.fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
          }}
        />
      </div>

      {/* Footer with progress */}
      <footer className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <ProgressBar percentage={percentage} />
      </footer>
    </div>
  );
}
