import { useEffect } from 'react'
import { useSettings } from '@/hooks/use-settings.ts'

export function DocumentTheme() {
  const { settings } = useSettings()

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  return null
}
