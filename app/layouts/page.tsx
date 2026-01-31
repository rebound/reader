import { Outlet } from 'react-router'
import { DocumentTheme } from '@/components/document-theme.tsx'

export default function Page() {
  return (
    <div className="min-h-dvh">
      <DocumentTheme />
      <Outlet />
    </div>
  )
}
