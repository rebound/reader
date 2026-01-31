import { useQuery } from '@tanstack/react-query'
import { db } from '@/utilities/db.ts'
import type { Book } from '@/utilities/db.ts'

export function useBookByKey(key: string | undefined) {
  return useQuery({
    queryKey: ['book', key],
    queryFn: async (): Promise<Book | null> => {
      if (!key) return null
      const book = await db.books.where('key').equals(key).first()
      return book ?? null
    },
    enabled: !!key,
  })
}
