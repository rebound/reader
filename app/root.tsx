import { QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { queryClient } from '@/services/query-client.client.ts'
import type { Route } from './+types/root.ts'
import type { PropsWithChildren } from 'react'
import './styles/main.css'

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reader</title>
        <Meta />
        <meta name="theme-color" content="#f4ecd8" />
        <meta name="description" content="Free privacy-first EPUB and PDF reader - 100% offline" />
        <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <Links />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { t } = useTranslation()

  return (
    <>
      <title>{t('app.name')}</title>
      <meta name="description" content={t('meta.description')} />

      <Outlet />
    </>
  )
}

export function HydrateFallback(_props: Route.HydrateFallbackProps) {
  return <></>
}
