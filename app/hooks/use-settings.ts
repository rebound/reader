import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useMemo } from 'react'
import { db } from '@/utilities/db.ts'

export type Theme = 'light' | 'sepia' | 'dark' | (string & {})
export type FontFamily = 'serif' | 'sans' | (string & {})

export type Settings = {
  theme: Theme
  fontSize: number
  fontFamily: FontFamily
  lineHeight: number
}

const defaultSettings: Settings = {
  theme: 'sepia',
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.6,
}

export function useSettings() {
  const settingsRecords = useLiveQuery(() => db.settings.toArray(), [])

  const settings = useMemo<Settings>(() => {
    const result = { ...defaultSettings }

    if (settingsRecords) {
      for (const record of settingsRecords) {
        if (record.key in defaultSettings) {
          const key = record.key as keyof Settings
          if (key === 'theme') {
            result.theme = record.value
          } else if (key === 'fontFamily') {
            result.fontFamily = record.value
          } else if (key === 'fontSize') {
            result.fontSize = parseInt(record.value, 10) || defaultSettings.fontSize
          } else {
            result.lineHeight = parseFloat(record.value) || defaultSettings.lineHeight
          }
        }
      }
    }

    return result
  }, [settingsRecords])

  const updateSetting = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> => {
    const stringValue = String(value)

    // Delete any existing records with this key, then add the new value
    await db.settings.where('key').equals(key).delete()
    await db.settings.add({ key, value: stringValue })
  }, [])

  return {
    settings,
    updateSetting,
  }
}
