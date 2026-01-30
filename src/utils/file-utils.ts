import ePub from 'epubjs';

export interface EpubMetadata {
  title: string;
  author: string;
  cover: Blob | null;
}

export interface PdfMetadata {
  title: string;
  author: string;
  cover: Blob | null;
  pageCount: number;
}

export function getFileType(file: File): 'epub' | 'pdf' | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.epub')) return 'epub';
  if (name.endsWith('.pdf')) return 'pdf';
  return null;
}

export async function extractEpubMetadata(arrayBuffer: ArrayBuffer): Promise<EpubMetadata> {
  // Copy the ArrayBuffer - epub.js may detach the original
  const bufferCopy = arrayBuffer.slice(0);
  const book = ePub(bufferCopy);
  await book.ready;

  const metadata = await book.loaded.metadata;
  let coverUrl: string | null = null;

  try {
    coverUrl = await book.coverUrl();
  } catch {
    // No cover available
  }

  // Convert cover URL to blob for storage
  let coverBlob: Blob | null = null;
  if (coverUrl) {
    try {
      const response = await fetch(coverUrl);
      coverBlob = await response.blob();
    } catch {
      // Failed to fetch cover
    }
  }

  book.destroy();

  return {
    title: metadata.title || 'Untitled',
    author: metadata.creator || 'Unknown Author',
    cover: coverBlob,
  };
}

export async function extractPdfMetadata(arrayBuffer: ArrayBuffer): Promise<PdfMetadata> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  // Copy the ArrayBuffer - pdf.js detaches the original
  const bufferCopy = arrayBuffer.slice(0);
  const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise;
  const metadata = await pdf.getMetadata();

  // Generate cover from first page
  let coverBlob: Blob | null = null;
  try {
    const page = await pdf.getPage(1);
    const scale = 0.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      coverBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      });
    }
  } catch {
    // Failed to generate cover
  }

  const numPages = pdf.numPages;
  pdf.destroy();

  const info = (metadata?.info || {}) as Record<string, string>;

  return {
    title: info.Title || 'Untitled PDF',
    author: info.Author || 'Unknown Author',
    cover: coverBlob,
    pageCount: numPages,
  };
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
