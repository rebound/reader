import { BookOpen, FileText, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Book } from '@/utils/db.ts'
import type { MouseEvent } from 'react'

type BookCardProps = {
  book: Book
  onDelete: () => void
}

export function BookCard({ book, onDelete }: BookCardProps) {
  const { t } = useTranslation()
  const [showDelete, setShowDelete] = useState(false)
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

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(t('book.delete_confirm', { title: book.title }))) {
      onDelete()
    }
  }

  const TypeIcon = book.type === 'epub' ? BookOpen : FileText

  return (
    <div
      className="group relative cursor-pointer rounded-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => {
        setShowDelete(true)
      }}
      onMouseLeave={() => {
        setShowDelete(false)
      }}
    >
      <div className="mb-3 aspect-2/3 overflow-hidden rounded-lg bg-rule shadow-md">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <TypeIcon className="mb-2 h-12 w-12 opacity-30" />
            <span className="text-xs tracking-wide uppercase opacity-40">{book.type}</span>
          </div>
        )}

        {showDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
            title={t('book.delete_button')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-1">
        <h3 className="mb-1 line-clamp-2 font-serif text-sm leading-tight font-medium">{book.title}</h3>
        <p className="line-clamp-1 text-xs opacity-60">{book.author}</p>
      </div>
    </div>
  )
}
