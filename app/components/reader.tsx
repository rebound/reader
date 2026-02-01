import { EpubReader } from '@/components/epub-reader.tsx'
import { PdfReader } from '@/components/pdf-reader.tsx'
import type { Settings } from '@/hooks/use-settings.ts'
import type { Book } from '@/utilities/db.ts'

type ReaderProps = {
  book: Book
  onClose: () => void
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>
}

export function Reader({ book, onClose, settings, onUpdateSetting }: ReaderProps) {
  if (book.type === 'epub') {
    return <EpubReader book={book} onClose={onClose} settings={settings} onUpdateSetting={onUpdateSetting} />
  }

  return <PdfReader book={book} onClose={onClose} settings={settings} onUpdateSetting={onUpdateSetting} />
}
