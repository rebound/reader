import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { EpubReader } from '@/components/epub-reader.tsx'
import { PdfReader } from '@/components/pdf-reader.tsx'
import { Spinner } from '@/components/spinner.tsx'
import { useBookByKey } from '@/hooks/use-book-query.ts'
import { useSettings } from '@/hooks/use-settings.ts'

export default function BookRoute() {
  const { t } = useTranslation()
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { settings, updateSetting } = useSettings()

  const { data: book, isLoading, error } = useBookByKey(bookId)

  const handleClose = () => {
    void navigate('/')
  }

  if (isLoading) {
    return (
      <>
        <title>{t('meta.title_template', { title: '...' })}</title>
        <div className="flex h-screen items-center justify-center bg-paper text-ink">
          <Spinner />
        </div>
      </>
    )
  }

  if (error || !book) {
    return (
      <>
        <title>{t('meta.title_template', { title: 'book.not_found' })}</title>
        <div className="flex h-screen flex-col items-center justify-center bg-paper text-ink">
          <p className="mb-4 text-lg">{error instanceof Error ? error.message : t('book.not_found')}</p>
          <button
            onClick={handleClose}
            className="rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:opacity-90"
          >
            {t('common.back_to_library')}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <title>{t('meta.title_template', { title: book.title })}</title>
      {book.type === 'epub' && (
        <EpubReader book={book} onClose={handleClose} settings={settings} onUpdateSetting={updateSetting} />
      )}
      {book.type === 'pdf' && (
        <PdfReader book={book} onClose={handleClose} settings={settings} onUpdateSetting={updateSetting} />
      )}
    </>
  )
}
