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
        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-black/5"
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

      <div className="fixed top-0 left-0 z-50 flex h-full w-80 flex-col bg-paper text-ink shadow-xl">
        <div className="flex items-center justify-between border-b border-rule p-4">
          <h2 className="font-serif font-semibold">{t('sidebar.title')}</h2>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-rule">
          <button
            onClick={() => {
              setActiveTab('toc')
            }}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'toc' && 'border-b-2 border-accent',
              activeTab !== 'toc' && 'opacity-60',
            )}
          >
            <List className="mx-auto h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('bookmarks')
            }}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'bookmarks' && 'border-b-2 border-accent',
              activeTab !== 'bookmarks' && 'opacity-60',
            )}
          >
            <Bookmark className="mx-auto h-4 w-4" />
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
                      className="group flex items-center justify-between px-4 py-2 hover:bg-black/5"
                    >
                      <button
                        onClick={() => {
                          onNavigate(bookmark.location)
                        }}
                        className="flex-1 truncate text-left text-sm"
                      >
                        {bookmark.label || t('sidebar.bookmarks.page_label', { location: bookmark.location })}
                      </button>
                      <button
                        onClick={() => {
                          if (bookmark.id) onDeleteBookmark(bookmark.id)
                        }}
                        className="p-1 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
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
