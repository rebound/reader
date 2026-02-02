import { BookOpen, Import } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AppFooter } from '@/components/app-footer.tsx'
import { AppHeader } from '@/components/app-header.tsx'
import { AppShell } from '@/components/app-shell.tsx'
import { BookCard } from '@/components/book-card.tsx'
import { DropZone } from '@/components/drop-zone.tsx'
import { Spinner } from '@/components/spinner.tsx'
import { useBooks } from '@/hooks/use-books.ts'
import { useImportBooks } from '@/hooks/use-import-books.ts'

export default function LibraryRoute() {
  const { t } = useTranslation()
  const { books, loading, deleteBookByKey } = useBooks()
  const { mutate: importBooks, isPending: importing, error } = useImportBooks()

  const handleFilesAccepted = (files: File[]) => {
    if (files.length === 0) return
    importBooks(files)
  }

  const importButton = (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:opacity-90">
      <Import className="size-5" />
      <span className="font-medium">{t('library.import')}</span>
      <input
        type="file"
        accept=".epub,.pdf"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            handleFilesAccepted(Array.from(e.target.files))
            e.target.value = ''
          }
        }}
        className="hidden"
        disabled={importing}
      />
    </label>
  )

  return (
    <>
      <title>{t('meta.title_template', { title: 'library.title' })}</title>
      <AppShell>
        <AppHeader actions={importButton} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-100 p-4 text-red-700">
              {error.message || t('library.import_error')}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : books.length === 0 ? (
            <DropZone onFilesAccepted={handleFilesAccepted} disabled={importing} className="p-16 text-center">
              <BookOpen className="mx-auto mb-6 h-16 w-16 text-accent" />
              <h2 className="mb-2 font-serif text-xl">{t('library.empty.title')}</h2>
              <p className="mb-6 opacity-60">{t('library.empty.description')}</p>
              {importing && (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('library.importing')}</span>
                </div>
              )}
            </DropZone>
          ) : (
            <>
              <DropZone onFilesAccepted={handleFilesAccepted} disabled={importing} className="mb-8 p-8 text-center">
                <p className="opacity-60">{importing ? t('library.importing') : t('library.drop_zone.hint')}</p>
              </DropZone>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {books.map((book) => (
                  <Link key={book.key} to={`/book/${book.key}`}>
                    <BookCard book={book} onDelete={() => void deleteBookByKey(book.key)} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>

        <AppFooter />
      </AppShell>
    </>
  )
}
