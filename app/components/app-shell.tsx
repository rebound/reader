import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return <div className="flex min-h-screen flex-col bg-paper text-ink transition-colors duration-300">{children}</div>
}
