import ePub from 'epubjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TocItem } from '@/components/sidebar.tsx'
import type { Book as EpubBook, Location, NavItem, Rendition } from 'epubjs'
import type { RefObject } from 'react'

type EpubReaderOptions = {
  fileData: ArrayBuffer
  bookId: number
  initialLocation?: string | null
}

type EpubReaderState = {
  toc: TocItem[]
  currentLocation: string | null
  percentage: number
  isReady: boolean
  error: Error | null
}

type EpubReaderActions = {
  goToLocation: (cfi: string) => void
  goToPrev: () => void
  goToNext: () => void
  applyTheme: (theme: string, fontSize: number, fontFamily: string, lineHeight: number) => void
}

type UseEpubReaderReturn = EpubReaderState &
  EpubReaderActions & {
    viewerRef: RefObject<HTMLDivElement | null>
  }

export function useEpubReader({ fileData, bookId, initialLocation }: EpubReaderOptions): UseEpubReaderReturn {
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const bookRef = useRef<EpubBook | null>(null)
  const initialLocationRestored = useRef(false)
  const locationsReady = useRef(false)

  const [toc, setToc] = useState<TocItem[]>([])
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [percentage, setPercentage] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Initialize epub book and rendition - only depends on fileData and bookId
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const viewerElement = viewerRef.current
    if (!viewerElement) return

    // Reset state for a new book
    initialLocationRestored.current = false
    locationsReady.current = false
    setIsReady(false)
    setError(null)
    setToc([])
    setCurrentLocation(null)
    setPercentage(0)

    try {
      // Copy ArrayBuffer - epub.js may detach the original
      const bufferCopy = fileData.slice(0)
      const epubBook = ePub(bufferCopy)
      bookRef.current = epubBook

      const rendition = epubBook.renderTo(viewerElement, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated',
      })

      renditionRef.current = rendition

      // Load table of contents
      void epubBook.loaded.navigation.then((nav) => {
        const tocItems: TocItem[] = nav.toc.map((item: NavItem) => ({
          label: item.label,
          href: item.href,
          subitems: item.subitems?.map((sub: NavItem) => ({
            label: sub.label,
            href: sub.href,
          })),
        }))
        setToc(tocItems)
      })

      // Handle location changes
      rendition.on('relocated', (location: Location) => {
        setCurrentLocation(location.start.cfi)
        const pct = epubBook.locations.percentageFromCfi(location.start.cfi)
        setPercentage(Math.round((pct || 0) * 100))
      })

      // Set ready when content is actually rendered
      rendition.on('rendered', () => {
        setIsReady(true)
      })

      // Generate locations for percentage tracking, then display at beginning
      // Progress restoration happens in a separate effect
      void epubBook.ready
        .then(() => epubBook.locations.generate(1024))
        .then(() => {
          locationsReady.current = true
          // Don't display yet - wait for progress restoration effect
        })
        .catch((e: unknown) => {
          console.error('Failed to initialize EPUB:', e)
          setError(e instanceof Error ? e : new Error('Failed to load EPUB'))
        })

      // Keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          void rendition.prev()
        } else if (e.key === 'ArrowRight') {
          void rendition.next()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      // Handle resize to keep epub content within the viewport
      const handleResize = () => {
        if (renditionRef.current) {
          const { clientWidth, clientHeight } = viewerElement
          renditionRef.current.resize(clientWidth, clientHeight)
        }
      }

      window.addEventListener('resize', handleResize)

      // Also use ResizeObserver for container size changes
      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(viewerElement)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', handleResize)
        resizeObserver.disconnect()
        setIsReady(false)
        rendition.destroy()
        epubBook.destroy()
        renditionRef.current = null
        bookRef.current = null
      }
    } catch (e) {
      console.error('Failed to create EPUB book:', e)
      setError(e instanceof Error ? e : new Error('Failed to create EPUB book'))
    }
  }, [fileData, bookId])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Restore the initial location once a book is ready and progress is loaded
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition || initialLocationRestored.current) return

    // Wait for locations to be generated
    if (!locationsReady.current) {
      // Poll until ready - locations.generate is async, and we need to wait
      const checkReady = setInterval(() => {
        if (locationsReady.current && !initialLocationRestored.current) {
          clearInterval(checkReady)
          initialLocationRestored.current = true
          if (initialLocation) {
            void rendition.display(initialLocation)
          } else {
            void rendition.display()
          }
        }
      }, 50)

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkReady)
        if (!initialLocationRestored.current) {
          initialLocationRestored.current = true
          void rendition.display()
        }
      }, 10000)

      return () => {
        clearInterval(checkReady)
        clearTimeout(timeout)
      }
    }

    // Locations are ready, display now
    initialLocationRestored.current = true
    if (initialLocation) {
      void rendition.display(initialLocation)
    } else {
      void rendition.display()
    }
  }, [initialLocation])

  // Navigation actions
  const goToLocation = useCallback((cfi: string) => {
    if (renditionRef.current) {
      void renditionRef.current.display(cfi)
    }
  }, [])

  const goToPrev = useCallback(() => {
    if (renditionRef.current) {
      void renditionRef.current.prev()
    }
  }, [])

  const goToNext = useCallback(() => {
    if (renditionRef.current) {
      void renditionRef.current.next()
    }
  }, [])

  // Theme application
  const applyTheme = useCallback((theme: string, fontSize: number, fontFamily: string, lineHeight: number) => {
    const rendition = renditionRef.current
    if (!rendition) return

    const themeColors: Record<string, { background: string; color: string }> = {
      light: { background: '#ffffff', color: '#1f2937' },
      sepia: { background: '#f4ecd8', color: '#433422' },
      dark: { background: '#1a1a1a', color: '#e5e5e5' },
    }

    const colors = themeColors[theme] ?? themeColors.light

    // epub.js themes use CSS property names in the object
    const themeStyles = {
      body: {
        background: colors.background,
        color: colors.color,
        'font-family': `${fontFamily} !important`,
        'line-height': `${lineHeight} !important`,
      },
      'p, div, span, li, td, th, blockquote, pre': {
        'font-family': `${fontFamily} !important`,
        'line-height': `${lineHeight} !important`,
      },
      'h1, h2, h3, h4, h5, h6': {
        'font-family': `${fontFamily} !important`,
      },
    }

    try {
      rendition.themes.register('current', themeStyles)
      rendition.themes.select('current')
      rendition.themes.fontSize(`${fontSize}px`)
    } catch (e) {
      // Themes are not ready yet, will retry on the next call
      console.debug('Theme application deferred:', e)
    }
  }, [])

  return {
    viewerRef,
    toc,
    currentLocation,
    percentage,
    isReady,
    error,
    goToLocation,
    goToPrev,
    goToNext,
    applyTheme,
  }
}
