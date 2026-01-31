import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBooks } from '@/hooks/use-books.ts'

export function useImportBooks() {
  const queryClient = useQueryClient()
  const { addBook } = useBooks()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const results: Array<{ file: string; success: boolean; error?: string }> = []

      for (const file of files) {
        try {
          await addBook(file)
          results.push({ file: file.name, success: true })
        } catch (e) {
          results.push({
            file: file.name,
            success: false,
            error: e instanceof Error ? e.message : 'Import failed',
          })
        }
      }

      const failures = results.filter((r) => !r.success)
      if (failures.length > 0) {
        throw new Error(failures.map((f) => `${f.file}: ${f.error}`).join('\n'))
      }

      return results
    },
    onSuccess: () => {
      // Invalidate book queries to refresh the library
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
