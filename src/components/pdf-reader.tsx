import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bookmark,
  BookmarkPlus,
  Settings,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Sidebar, type TocItem } from './sidebar';
import { SettingsPanel } from './settings-panel';
import { Spinner } from './spinner';
import { ProgressBar } from './progress-bar';
import { useProgress } from '../hooks/use-progress';
import { useBookmarks } from '../hooks/use-bookmarks';
import type { Book } from '../utils/db';
import type { Settings as SettingsType } from '../hooks/use-settings';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfReaderProps {
  book: Book;
  onClose: () => void;
  settings: SettingsType;
  onUpdateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>;
}

export function PdfReader({ book, onClose, settings, onUpdateSetting }: PdfReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);

  const { progress, updateProgress } = useProgress(book.id);
  const { bookmarks, createBookmark, removeBookmark } = useBookmarks(book.id);

  // Initialize PDF
  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      try {
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        // Copy ArrayBuffer - pdf.js worker detaches the original
        const bufferCopy = book.fileData.slice(0);
        const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);

        // Try to get outline/TOC
        try {
          const outline = await pdf.getOutline();
          if (outline) {
            const tocItems: TocItem[] = await Promise.all(
              outline.map(async (item) => {
                let pageNumber = 1;
                if (item.dest) {
                  try {
                    const dest =
                      typeof item.dest === 'string'
                        ? await pdf.getDestination(item.dest)
                        : item.dest;
                    if (dest) {
                      const pageIndex = await pdf.getPageIndex(dest[0]);
                      pageNumber = pageIndex + 1;
                    }
                  } catch {
                    // Use default page
                  }
                }
                return {
                  label: item.title,
                  href: String(pageNumber),
                };
              })
            );
            setToc(tocItems);
          }
        } catch {
          // No TOC available
        }

        // Restore position or start from beginning
        const startPage = progress?.location ? parseInt(progress.location, 10) : 1;
        setCurrentPage(Math.min(startPage, pdf.numPages));
        setLoading(false);
      } catch (e) {
        console.error('Failed to load PDF:', e);
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [book.fileData, book.id]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (e) {
        console.error('Failed to render page:', e);
      }
    };

    renderPage();
  }, [currentPage, scale]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(numPages, prev + 1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Check if current page is bookmarked
  useEffect(() => {
    const isBookmarked = bookmarks.some((bm) => bm.location === String(currentPage));
    setIsCurrentPageBookmarked(isBookmarked);
  }, [currentPage, bookmarks]);

  // Save progress
  useEffect(() => {
    if (currentPage && numPages) {
      const pct = Math.round((currentPage / numPages) * 100);
      const timer = setTimeout(() => {
        updateProgress(String(currentPage), pct);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, numPages, updateProgress]);

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  }, [numPages]);

  const goToPage = useCallback(
    (pageNum: string) => {
      const page = parseInt(pageNum, 10);
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
        setShowSidebar(false);
      }
    },
    [numPages]
  );

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev + 0.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  }, []);

  const toggleBookmark = useCallback(() => {
    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks.find((bm) => bm.location === String(currentPage));
      if (bookmark?.id) {
        removeBookmark(bookmark.id);
      }
    } else {
      createBookmark(String(currentPage), `Page ${currentPage}`);
    }
  }, [currentPage, isCurrentPageBookmarked, bookmarks, removeBookmark, createBookmark]);

  const percentage = numPages > 0 ? Math.round((currentPage / numPages) * 100) : 0;

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
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm opacity-60 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
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
          onNavigate={goToPage}
          onDeleteBookmark={removeBookmark}
          isPdf={true}
        />

        {/* Settings panel */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onClose={() => setShowSettings(false)}
            isPdf={true}
          />
        )}

        {/* Navigation buttons */}
        <button
          onClick={goToPrev}
          disabled={currentPage <= 1}
          className="absolute left-0 top-0 bottom-0 w-16 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, var(--bg-color), transparent)' }}
        >
          <ChevronLeft className="w-8 h-8 opacity-50" />
        </button>

        <button
          onClick={goToNext}
          disabled={currentPage >= numPages}
          className="absolute right-0 top-0 bottom-0 w-16 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to left, var(--bg-color), transparent)' }}
        >
          <ChevronRight className="w-8 h-8 opacity-50" />
        </button>

        {/* PDF viewer */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-start justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="block mx-auto shadow-lg"
              style={{
                filter: settings.theme === 'sepia' ? 'sepia(0.2)' : 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Footer with progress */}
      <footer className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-60">
            Page {currentPage} of {numPages}
          </span>
          <ProgressBar percentage={percentage} className="flex-1" />
        </div>
      </footer>
    </div>
  );
}
