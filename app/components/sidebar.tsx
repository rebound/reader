import { clsx } from 'clsx'
import { Bookmark, List, Trash, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Bookmark as BookmarkType } from '@/utilities/db.ts'

export type TocItem = {
  href: string
  label: string
  subitems?: TocItem[]
}

type SidebarProps = {
  show: boolean
  onClose: () => void
  toc: TocItem[]
  bookmarks: BookmarkType[]
  onNavigate: (href: string) => void
  onDeleteBookmark: (id: number) => void
  isPdf?: boolean
}

type Tab = 'toc' | 'bookmarks'

export function Sidebar({
  show,
  onClose,
  toc,
  bookmarks,
  onNavigate,
  onDeleteBookmark,
  isPdf: _isPdf = false,
}: SidebarProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('toc')

  if (!show) return null

  const renderTocItem = (item: TocItem, depth = 0) => (
    <div key={item.href}>
      <button
        onClick={() => {
          onNavigate(item.href)
        }}
        className="min-h-11 w-full px-4 py-3 text-left text-sm transition-colors hover:bg-black/5 active:bg-black/10"
        style={{ paddingLeft: `${1 + depth}rem` }}
      >
        {item.label}
      </button>
      {item.subitems?.map((subitem) => renderTocItem(subitem, depth + 1))}
    </div>
  )

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={t('sidebar.close')}
        className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose()
        }}
      />

      <div className="fixed top-0 left-0 z-50 flex h-full w-full flex-col bg-paper text-ink shadow-xl sm:w-80">
        <div className="flex items-center justify-between border-b border-rule p-4">
          <h2 className="font-serif font-semibold">{t('sidebar.title')}</h2>
          <button
            onClick={onClose}
            className="flex min-h-10 min-w-10 items-center justify-center rounded p-1 transition-colors hover:bg-black/5 active:bg-black/10"
            aria-label={t('sidebar.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-rule">
          <button
            onClick={() => {
              setActiveTab('toc')
            }}
            className={clsx(
              'min-h-12 flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'toc' && 'border-b-2 border-accent',
              activeTab !== 'toc' && 'opacity-60',
            )}
          >
            <List className="mx-auto h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setActiveTab('bookmarks')
            }}
            className={clsx(
              'min-h-12 flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'bookmarks' && 'border-b-2 border-accent',
              activeTab !== 'bookmarks' && 'opacity-60',
            )}
          >
            <Bookmark className="mx-auto h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'toc' && (
            <div className="py-2">
              {toc.length > 0 ? (
                toc.map((item) => renderTocItem(item))
              ) : (
                <p className="p-4 text-sm opacity-60">{t('sidebar.toc.empty')}</p>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="py-2">
              {bookmarks.length > 0 ? (
                <div>
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group flex min-h-11 items-center justify-between px-4 hover:bg-black/5 active:bg-black/10"
                    >
                      <button
                        onClick={() => {
                          onNavigate(bookmark.location)
                        }}
                        className="min-h-11 flex-1 truncate py-3 text-left text-sm"
                      >
                        {bookmark.label || t('sidebar.bookmarks.page_label', { location: bookmark.location })}
                      </button>
                      <button
                        onClick={() => {
                          if (bookmark.id) onDeleteBookmark(bookmark.id)
                        }}
                        className="min-h-10 min-w-10 rounded p-2 opacity-60 transition-all active:bg-red-100 active:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:text-red-500"
                        aria-label={t('reader.bookmark.remove')}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm opacity-60">{t('sidebar.bookmarks.empty')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
