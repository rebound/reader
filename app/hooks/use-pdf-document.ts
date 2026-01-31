import { useQuery } from '@tanstack/react-query'
import type { TocItem } from '@/components/sidebar.tsx'
import type { PDFDocumentProxy } from 'pdfjs-dist'

type PdfDocumentData = {
  document: PDFDocumentProxy
  numPages: number
  toc: TocItem[]
}

async function loadPdfDocument(fileData: ArrayBuffer): Promise<PdfDocumentData> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

  // Copy ArrayBuffer - pdf.js worker detaches the original
  const bufferCopy = fileData.slice(0)
  const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise

  // Extract TOC
  let toc: TocItem[] = []
  try {
    const outline = await pdf.getOutline()
    if (outline.length > 0) {
      toc = await Promise.all(
        outline.map(async (item) => {
          let pageNumber = 1
          if (item.dest) {
            try {
              const dest = typeof item.dest === 'string' ? await pdf.getDestination(item.dest) : item.dest
              if (dest) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- pdf.js types are incomplete
                const pageIndex = await pdf.getPageIndex(dest[0])
                pageNumber = pageIndex + 1
              }
            } catch {
              // Use default page
            }
          }
          return {
            label: item.title,
            href: String(pageNumber),
          }
        }),
      )
    }
  } catch {
    // No TOC available
  }

  return {
    document: pdf,
    numPages: pdf.numPages,
    toc,
  }
}

export function usePdfDocument(bookId: number | undefined, fileData: ArrayBuffer | undefined) {
  return useQuery({
    queryKey: ['pdf-document', bookId],
    queryFn: async () => {
      if (!fileData) {
        throw new Error('No file data provided')
      }
      return loadPdfDocument(fileData)
    },
    enabled: !!bookId && !!fileData,
    staleTime: Number.POSITIVE_INFINITY, // PDF documents don't change
    gcTime: 1000 * 60, // Keep in cache for 1 minute
  })
}
