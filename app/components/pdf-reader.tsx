import {
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '@/components/progress-bar.tsx'
import { SettingsPanel } from '@/components/settings-panel.tsx'
import { Sidebar } from '@/components/sidebar.tsx'
import { Spinner } from '@/components/spinner.tsx'
import { useBookmarks } from '@/hooks/use-bookmarks.ts'
import { usePdfDocument } from '@/hooks/use-pdf-document.ts'
import { useProgress } from '@/hooks/use-progress.ts'
import type { Settings as SettingsType } from '@/hooks/use-settings.ts'
import type { Book } from '@/utilities/db.ts'

type PdfReaderProps = {
  book: Book
  onClose: () => void
  settings: SettingsType
  onUpdateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>
}

export function PdfReader({ book, onClose, settings, onUpdateSetting }: PdfReaderProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const initialPageSet = useRef(false)

  const [currentPage, setCurrentPage] = useState<number | null>(null)
  const [scale, setScale] = useState(1.2)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load PDF document with TanStack Query
  const { data: pdfData, isLoading: pdfLoading, error: pdfError } = usePdfDocument(book.id, book.fileData)

  // Load progress and bookmarks from IndexedDB
  const { progress, updateProgress } = useProgress(book.id)
  const { bookmarks, createBookmark, removeBookmark } = useBookmarks(book.id)

  const numPages = pdfData?.numPages ?? 0
  const toc = pdfData?.toc ?? []

  // Set the initial page once when PDF is loaded (considering saved progress)
  // This is a valid one-time initialisation pattern - the effect only runs once per book
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!pdfData || initialPageSet.current) return

    let startPage = 1
    if (progress?.location) {
      const savedPage = parseInt(progress.location, 10)
      if (savedPage >= 1 && savedPage <= pdfData.numPages) {
        startPage = savedPage
      }
    }

    setCurrentPage(startPage)
    initialPageSet.current = true
  }, [pdfData, progress?.location])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Render current page
  useEffect(() => {
    if (!pdfData || currentPage === null || !canvasRef.current) return

    // Cancel any pending render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const renderPage = async () => {
      try {
        const page = await pdfData.document.getPage(currentPage)
        const viewport = page.getViewport({ scale })

        // Clear and resize canvas
        canvas.height = viewport.height
        canvas.width = viewport.width
        context.clearRect(0, 0, canvas.width, canvas.height)

        const renderTask = page.render({
          canvas: canvasRef.current,
          canvasContext: context,
          viewport: viewport,
        })
        renderTaskRef.current = renderTask

        await renderTask.promise
        renderTaskRef.current = null
      } catch (e) {
        // Ignore cancelled render errors
        if (e instanceof Error && e.message.includes('Rendering cancelled')) {
          return
        }
        console.error('Failed to render page:', e)
      }
    }

    void renderPage()

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdfData, currentPage, scale])

  // Keyboard navigation
  useEffect(() => {
    if (!numPages) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => (prev ? Math.max(1, prev - 1) : 1))
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => (prev ? Math.min(numPages, prev + 1) : 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [numPages])

  // Save progress (debounced)
  useEffect(() => {
    if (!currentPage || !numPages) return

    const pct = Math.round((currentPage / numPages) * 100)
    const timer = setTimeout(() => {
      void updateProgress(String(currentPage), pct)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [currentPage, numPages, updateProgress])

  // Check if the current page is bookmarked
  const isCurrentPageBookmarked = useMemo(() => {
    if (!currentPage) return false
    return bookmarks.some((bm) => bm.location === String(currentPage))
  }, [currentPage, bookmarks])

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => (prev ? Math.max(1, prev - 1) : 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev ? Math.min(numPages, prev + 1) : 1))
  }, [numPages])

  const goToPage = useCallback(
    (pageNum: string) => {
      const page = parseInt(pageNum, 10)
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page)
        setShowSidebar(false)
      }
    },
    [numPages],
  )

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev + 0.1))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.1))
  }, [])

  const toggleBookmark = useCallback(() => {
    if (!currentPage) return

    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks.find((bm) => bm.location === String(currentPage))
      if (bookmark?.id) {
        void removeBookmark(bookmark.id)
      }
    } else {
      void createBookmark(String(currentPage), t('reader.bookmark.pdf_label', { page: currentPage }))
    }
  }, [currentPage, isCurrentPageBookmarked, bookmarks, removeBookmark, createBookmark, t])

  const percentage = numPages > 0 && currentPage ? Math.round((currentPage / numPages) * 100) : 0
  const isLoading = pdfLoading || currentPage === null

  if (pdfError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-paper text-ink">
        <p className="mb-4 text-lg">{t('reader.load_error.pdf')}</p>
        <button
          onClick={onClose}
          className="rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:opacity-90"
        >
          {t('common.back_to_library')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-paper text-ink transition-colors duration-300">
      <header className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowSidebar(!showSidebar)
            }}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-black/5">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <h1 className="max-w-md truncate font-serif text-lg">{book.title}</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            title={t('reader.zoom.out')}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="w-12 text-center text-sm opacity-60">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            aria-label={t('reader.zoom.in')}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={toggleBookmark}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            aria-label={isCurrentPageBookmarked ? t('reader.bookmark.remove') : t('reader.bookmark.add')}
          >
            {isCurrentPageBookmarked ? (
              <BookmarkPlus className="h-5 w-5 text-accent" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => {
              setShowSettings(!showSettings)
            }}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          show={showSidebar}
          onClose={() => {
            setShowSidebar(false)
          }}
          toc={toc}
          bookmarks={bookmarks}
          onNavigate={goToPage}
          onDeleteBookmark={removeBookmark}
          isPdf={true}
        />

        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdateSetting={onUpdateSetting}
            onClose={() => {
              setShowSettings(false)
            }}
          />
        )}

        <button
          onClick={goToPrev}
          disabled={!currentPage || currentPage <= 1}
          className="absolute top-0 bottom-0 left-0 z-10 flex w-16 items-center justify-center opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-8 w-8 opacity-50" />
        </button>

        <button
          onClick={goToNext}
          disabled={!currentPage || currentPage >= numPages}
          className="absolute top-0 right-0 bottom-0 z-10 flex w-16 items-center justify-center opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-8 w-8 opacity-50" />
        </button>

        <div ref={containerRef} className="flex flex-1 items-start justify-center overflow-auto py-8">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="mx-auto block shadow-lg" />
          )}
        </div>
      </div>

      <footer className="border-t border-rule px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-60">
            {t('reader.page_info', { current: currentPage ?? '-', total: numPages || '-' })}
          </span>
          <ProgressBar percentage={percentage} className="flex-1" />
        </div>
      </footer>
    </div>
  )
}
