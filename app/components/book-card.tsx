import { BookOpen, FileText, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Book } from '@/utilities/db.ts'
import type { MouseEvent } from 'react'

type BookCardProps = {
  book: Book
  onEdit: () => void
  onDelete: () => void
}

export function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const { t } = useTranslation()
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  // Create and cleanup blob URL in effect
  /* eslint-disable react-hooks/set-state-in-effect -- Blob URL lifecycle management requires effect */
  useEffect(() => {
    if (!book.cover) {
      setCoverUrl(null)
      return
    }

    const url = URL.createObjectURL(book.cover)
    setCoverUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [book.cover])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit()
  }

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(t('book.delete_confirm', { title: book.title }))) {
      onDelete()
    }
  }

  const TypeIcon = book.type === 'epub' ? BookOpen : FileText

  return (
    <div className="group relative cursor-pointer rounded-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-3 aspect-2/3 overflow-hidden rounded-lg bg-rule shadow-md">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <TypeIcon className="mb-2 h-12 w-12 opacity-30" />
            <span className="text-xs tracking-wide uppercase opacity-40">{book.type}</span>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={handleEdit}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-ink/70 p-2 text-white opacity-70 transition-opacity active:bg-ink/90 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:bg-ink/80"
            title={t('book.edit_button')}
            aria-label={t('book.edit_button')}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-red-500 p-2 text-white opacity-70 transition-opacity active:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:bg-red-600"
            title={t('book.delete_button')}
            aria-label={t('book.delete_button')}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-2 pb-2">
        <h3 className="mb-1 line-clamp-2 font-serif text-sm leading-tight font-medium">{book.title}</h3>
        <p className="line-clamp-1 text-xs opacity-60">{book.author}</p>
      </div>
    </div>
  )
}
