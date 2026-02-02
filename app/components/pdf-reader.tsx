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
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '@/components/progress-bar.tsx'
import { SettingsPanel } from '@/components/settings-panel.tsx'
import { Sidebar } from '@/components/sidebar.tsx'
import { Spinner } from '@/components/spinner.tsx'
import { useBookmarks } from '@/hooks/use-bookmarks.ts'
import { usePdfDocument } from '@/hooks/use-pdf-document.ts'
import { useProgress } from '@/hooks/use-progress.ts'
import { useSwipe } from '@/hooks/use-swipe.ts'
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

  // Reset scroll position and absorb inertial momentum
  const resetScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Temporarily disable scrolling to absorb momentum
    container.style.overflow = 'hidden'
    container.scrollTo(0, 0)

    // Re-enable after momentum has dissipated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.style.overflow = 'auto'
      })
    })
  }, [])

  const resetScrollEffectEvent = useEffectEvent(() => {
    resetScroll()
  })

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
        resetScrollEffectEvent()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => (prev ? Math.min(numPages, prev + 1) : 1))
        resetScrollEffectEvent()
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
  const isCurrentPageBookmarked = currentPage ? bookmarks.some((bm) => bm.location === String(currentPage)) : false

  const goToPrev = () => {
    setCurrentPage((prev) => (prev ? Math.max(1, prev - 1) : 1))
    resetScroll()
  }

  const goToNext = () => {
    setCurrentPage((prev) => (prev ? Math.min(numPages, prev + 1) : 1))
    resetScroll()
  }

  const goToPage = (pageNum: string) => {
    const page = parseInt(pageNum, 10)
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page)
      setShowSidebar(false)
      resetScroll()
    }
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.1))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.1))
  }

  const toggleBookmark = () => {
    if (!currentPage) return

    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks.find((bm) => bm.location === String(currentPage))
      if (bookmark?.id) {
        void removeBookmark(bookmark.id)
      }
    } else {
      void createBookmark(String(currentPage), t('reader.bookmark.pdf_label', { page: currentPage }))
    }
  }

  const percentage = numPages > 0 && currentPage ? Math.round((currentPage / numPages) * 100) : 0
  const isLoading = pdfLoading || currentPage === null

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  })

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
      <header className="flex items-center justify-between border-b border-rule px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => {
              setShowSidebar(!showSidebar)
            }}
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('sidebar.title')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('common.back_to_library')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <h1 className="max-w-24 truncate font-serif text-base sm:max-w-md sm:text-lg">{book.title}</h1>

        <div className="flex items-center gap-0 sm:gap-2">
          <button
            onClick={zoomOut}
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('reader.zoom.out')}
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="hidden w-12 text-center text-sm opacity-60 sm:block">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('reader.zoom.in')}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={toggleBookmark}
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
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
            className="min-h-10 min-w-10 rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('settings.title')}
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
          className="absolute top-0 bottom-0 left-0 z-10 flex w-12 items-center justify-center bg-gradient-to-r from-black/5 to-transparent opacity-100 transition-opacity active:from-black/10 disabled:pointer-events-none disabled:opacity-30 sm:w-16 sm:from-transparent sm:opacity-0 sm:hover:from-black/5 sm:hover:opacity-100"
          aria-label={t('reader.nav.prev')}
        >
          <ChevronLeft className="h-8 w-8 opacity-30 sm:opacity-50" />
        </button>

        <button
          onClick={goToNext}
          disabled={!currentPage || currentPage >= numPages}
          className="absolute top-0 right-0 bottom-0 z-10 flex w-12 items-center justify-center bg-gradient-to-l from-black/5 to-transparent opacity-100 transition-opacity active:from-black/10 disabled:pointer-events-none disabled:opacity-30 sm:w-16 sm:from-transparent sm:opacity-0 sm:hover:from-black/5 sm:hover:opacity-100"
          aria-label={t('reader.nav.next')}
        >
          <ChevronRight className="h-8 w-8 opacity-30 sm:opacity-50" />
        </button>

        <div
          ref={containerRef}
          className="flex flex-1 items-start justify-center overflow-auto py-8"
          {...swipeHandlers}
        >
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
