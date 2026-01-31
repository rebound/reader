import { nanoid } from 'nanoid'
import type { Book } from '@/utilities/db.ts'

export async function processFile(file: File): Promise<Omit<Book, 'id'>> {
  const arrayBuffer = await file.arrayBuffer()
  const type = getFileType(file.name)

  if (!type) {
    throw new Error('Unsupported file type. Please use EPUB or PDF files.')
  }

  const metadata = await extractMetadata(arrayBuffer, type)

  return {
    key: nanoid(12),
    title: metadata.title ?? file.name.replace(/\.(epub|pdf)$/i, ''),
    author: metadata.author ?? 'Unknown Author',
    type,
    fileData: arrayBuffer,
    cover: metadata.cover,
    pageCount: metadata.pageCount,
    addedAt: Date.now(),
  }
}

function getFileType(filename: string): 'epub' | 'pdf' | null {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'epub') return 'epub'
  if (ext === 'pdf') return 'pdf'
  return null
}

type Metadata = {
  title?: string
  author?: string
  cover: Blob | null
  pageCount?: number
}

async function extractMetadata(arrayBuffer: ArrayBuffer, type: 'epub' | 'pdf'): Promise<Metadata> {
  if (type === 'epub') {
    return extractEpubMetadata(arrayBuffer)
  } else {
    return extractPdfMetadata(arrayBuffer)
  }
}

async function extractEpubMetadata(arrayBuffer: ArrayBuffer): Promise<Metadata> {
  try {
    const ePub = (await import('epubjs')).default
    // Copy the ArrayBuffer - epub.js may detach the original
    const bufferCopy = arrayBuffer.slice(0)
    const book = ePub(bufferCopy)

    await book.ready

    const metadata = await book.loaded.metadata
    const meta = metadata as { title?: string; creator?: string }

    let cover: Blob | null = null
    try {
      const coverUrl = await book.coverUrl()
      if (coverUrl) {
        const response = await fetch(coverUrl)
        cover = await response.blob()
      }
    } catch {
      // No cover available
    }

    book.destroy()

    return {
      title: meta.title,
      author: meta.creator,
      cover,
    }
  } catch (e) {
    console.error('Failed to extract EPUB metadata:', e)
    return { cover: null }
  }
}

async function extractPdfMetadata(arrayBuffer: ArrayBuffer): Promise<Metadata> {
  try {
    const pdfjsLib = await import('pdfjs-dist')

    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

    // Copy the ArrayBuffer - pdf.js detaches the original
    const bufferCopy = arrayBuffer.slice(0)
    const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise

    const metadata = await pdf.getMetadata()
    const info = metadata.info as { Title?: string; Author?: string }

    // Try to render the first page as cover
    let cover: Blob | null = null
    try {
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.5 })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d')
      if (context) {
        await page.render({ canvas, canvasContext: context, viewport }).promise
        cover = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob)
            },
            'image/jpeg',
            0.8,
          )
        })
      }
    } catch {
      // Failed to generate cover
    }

    const pageCount = pdf.numPages
    void pdf.destroy()

    return {
      title: info.Title,
      author: info.Author,
      cover,
      pageCount,
    }
  } catch (e) {
    console.error('Failed to extract PDF metadata:', e)
    return { cover: null }
  }
}
