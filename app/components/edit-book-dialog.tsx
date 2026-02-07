import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Book } from '@/utilities/db.ts'
import type { SyntheticEvent } from 'react'

type EditBookDialogProps = {
  book: Book
  onSave: (id: number, changes: { title: string; author: string }) => void
  onClose: () => void
}

export function EditBookDialog({ book, onSave, onClose }: EditBookDialogProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()

    const handleClose = () => {
      onClose()
    }

    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
    }
  }, [onClose])

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedAuthor = author.trim()

    if (!trimmedTitle || !book.id) return

    onSave(book.id, { title: trimmedTitle, author: trimmedAuthor })
  }

  return (
    <dialog
      ref={dialogRef}
      className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-black/50"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <h2 className="font-serif text-lg font-medium">{t('book.edit.title')}</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-book-title" className="text-sm font-medium">
            {t('book.edit.field.title')}
          </label>
          <input
            id="edit-book-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
            className="rounded-lg border border-rule bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-book-author" className="text-sm font-medium">
            {t('book.edit.field.author')}
          </label>
          <input
            id="edit-book-author"
            type="text"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value)
            }}
            className="rounded-lg border border-rule bg-paper px-3 py-2.5 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-rule px-4 py-2.5 font-medium transition-colors hover:bg-rule/50"
          >
            {t('book.edit.action.cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:opacity-90"
          >
            {t('book.edit.action.save')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
