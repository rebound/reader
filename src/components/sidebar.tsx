import { useState } from 'react';
import { X, List, Bookmark, Trash2 } from 'lucide-react';
import type { Bookmark as BookmarkType } from '../utils/db';

export interface TocItem {
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface SidebarProps {
  show: boolean;
  onClose: () => void;
  toc: TocItem[];
  bookmarks: BookmarkType[];
  onNavigate: (href: string) => void;
  onDeleteBookmark: (id: number) => void;
  isPdf?: boolean;
}

type Tab = 'toc' | 'bookmarks';

export function Sidebar({
  show,
  onClose,
  toc,
  bookmarks,
  onNavigate,
  onDeleteBookmark,
  isPdf: _isPdf = false,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('toc');

  if (!show) return null;

  const renderTocItem = (item: TocItem, depth = 0) => (
    <div key={item.href}>
      <button
        onClick={() => onNavigate(item.href)}
        className="w-full text-left px-4 py-2 hover:bg-black/5 transition-colors text-sm"
        style={{ paddingLeft: `${1 + depth}rem` }}
      >
        {item.label}
      </button>
      {item.subitems?.map((subitem) => renderTocItem(subitem, depth + 1))}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-full w-80 z-50 shadow-xl flex flex-col"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h2 className="font-serif font-semibold">Menu</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('toc')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'toc' ? 'border-b-2' : 'opacity-60'
            }`}
            style={{ borderColor: activeTab === 'toc' ? 'var(--accent-color)' : 'transparent' }}
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'bookmarks' ? 'border-b-2' : 'opacity-60'
            }`}
            style={{
              borderColor: activeTab === 'bookmarks' ? 'var(--accent-color)' : 'transparent',
            }}
          >
            <Bookmark className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'toc' && (
            <div className="py-2">
              {toc.length > 0 ? (
                toc.map((item) => renderTocItem(item))
              ) : (
                <p className="p-4 text-sm opacity-60">No table of contents available</p>
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
                      className="flex items-center justify-between px-4 py-2 hover:bg-black/5 group"
                    >
                      <button
                        onClick={() => onNavigate(bookmark.location)}
                        className="flex-1 text-left text-sm truncate"
                      >
                        {bookmark.label || `Page ${bookmark.location}`}
                      </button>
                      <button
                        onClick={() => bookmark.id && onDeleteBookmark(bookmark.id)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm opacity-60">No bookmarks yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
