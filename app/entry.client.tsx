import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { HydratedRouter } from 'react-router/dom'
import { i18n } from '@/services/i18n.client.ts'
import { queryClient } from '@/services/query-client.client.ts'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <HydratedRouter unstable_useTransitions />
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>,
  )
})
