import { clsx } from 'clsx'
import { ArrowLeft, Bookmark, BookmarkPlus, ChevronLeft, ChevronRight, Menu, Settings } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProgressBar } from '@/components/progress-bar.tsx'
import { SettingsPanel } from '@/components/settings-panel.tsx'
import { Sidebar } from '@/components/sidebar.tsx'
import { Spinner } from '@/components/spinner.tsx'
import { useBookmarks } from '@/hooks/use-bookmarks.ts'
import { useEpubReader } from '@/hooks/use-epub-reader.ts'
import { useProgress } from '@/hooks/use-progress.ts'
import { useSwipe } from '@/hooks/use-swipe.ts'
import type { Settings as SettingsType } from '@/hooks/use-settings.ts'
import type { Book } from '@/utilities/db.ts'

type EpubReaderProps = {
  book: Book
  onClose: () => void
  settings: SettingsType
  onUpdateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>
}

export function EpubReader({ book, onClose, settings, onUpdateSetting }: EpubReaderProps) {
  const { t } = useTranslation()
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load progress and bookmarks from IndexedDB
  const { progress, updateProgress } = useProgress(book.id)
  const { bookmarks, createBookmark, removeBookmark } = useBookmarks(book.id)

  // Initialize epub reader with saved progress
  const { viewerRef, toc, currentLocation, percentage, isReady, error, goToLocation, goToPrev, goToNext, applyTheme } =
    useEpubReader({
      fileData: book.fileData,
      bookId: book.id ?? 0,
      initialLocation: progress?.location,
    })

  // Apply theme when settings or ready state changes
  useEffect(() => {
    if (isReady) {
      applyTheme(
        settings.theme,
        settings.fontSize,
        settings.fontFamily === 'sans' ? 'system-ui, sans-serif' : 'Georgia, serif',
        settings.lineHeight,
      )
    }
  }, [settings.theme, settings.fontSize, settings.fontFamily, settings.lineHeight, isReady, applyTheme])

  // Save progress periodically (debounced)
  useEffect(() => {
    if (currentLocation && percentage >= 0) {
      const timer = setTimeout(() => {
        void updateProgress(currentLocation, percentage)
      }, 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [currentLocation, percentage, updateProgress])

  // Check if the current location is bookmarked
  const isCurrentPageBookmarked = useMemo(() => {
    if (!currentLocation) return false
    return bookmarks.some((bm) => bm.location === currentLocation)
  }, [currentLocation, bookmarks])

  const handleNavigate = useCallback(
    (cfi: string) => {
      goToLocation(cfi)
      setShowSidebar(false)
    },
    [goToLocation],
  )

  const toggleBookmark = useCallback(() => {
    if (!currentLocation) return

    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks.find((bm) => bm.location === currentLocation)
      if (bookmark?.id) {
        void removeBookmark(bookmark.id)
      }
    } else {
      void createBookmark(currentLocation, t('reader.bookmark.page_label', { percentage }))
    }
  }, [currentLocation, isCurrentPageBookmarked, bookmarks, removeBookmark, createBookmark, percentage, t])

  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  })

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-paper text-ink">
        <p className="mb-4 text-lg">{t('reader.load_error.epub')}</p>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:opacity-90"
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
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('sidebar.title')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('common.back_to_library')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <h1 className="max-w-32 truncate font-serif text-base sm:max-w-md sm:text-lg">{book.title}</h1>

        <div className="flex items-center gap-0 sm:gap-2">
          <button
            onClick={toggleBookmark}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
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
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 transition-colors hover:bg-black/5 active:bg-black/10"
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
          onNavigate={handleNavigate}
          onDeleteBookmark={removeBookmark}
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
          className="absolute top-0 bottom-0 left-0 z-10 flex w-12 items-center justify-center bg-linear-to-r from-black/5 to-transparent opacity-100 transition-opacity active:from-black/10 sm:w-16 sm:from-transparent sm:opacity-0 sm:hover:from-black/5 sm:hover:opacity-100"
          aria-label={t('reader.nav.prev')}
        >
          <ChevronLeft className="h-8 w-8 opacity-30 sm:opacity-50" />
        </button>

        <button
          onClick={goToNext}
          className="absolute top-0 right-0 bottom-0 z-10 flex w-12 items-center justify-center bg-linear-to-l from-black/5 to-transparent opacity-100 transition-opacity active:from-black/10 sm:w-16 sm:from-transparent sm:opacity-0 sm:hover:from-black/5 sm:hover:opacity-100"
          aria-label={t('reader.nav.next')}
        >
          <ChevronRight className="h-8 w-8 opacity-30 sm:opacity-50" />
        </button>

        {!isReady && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p>{t('common.loading')}</p>
            </div>
          </div>
        )}

        <div className="relative mx-auto h-full w-full max-w-3xl flex-1 overflow-hidden" {...swipeHandlers}>
          <div
            ref={viewerRef}
            className={clsx(
              'absolute inset-0',
              settings.fontFamily === 'serif' && 'font-[Georgia,serif]',
              settings.fontFamily === 'sans' && 'font-[system-ui,sans-serif]',
            )}
          />
        </div>
      </div>

      <footer className="border-t border-rule px-4 py-2">
        <ProgressBar percentage={percentage} />
      </footer>
    </div>
  )
}
