import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
      experimental_prefetchInRender: true,
    },
  },
})
