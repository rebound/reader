import { clsx } from 'clsx'
import { Coffee, Moon, Sun, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FontFamily, Settings, Theme } from '@/hooks/use-settings.ts'

type SettingsPanelProps = {
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>
  onClose: () => void
}

const themes: Array<{ value: Theme; icon: typeof Sun }> = [
  { value: 'light', icon: Sun },
  { value: 'sepia', icon: Coffee },
  { value: 'dark', icon: Moon },
]

const fontFamilies: FontFamily[] = ['serif', 'sans']

export function SettingsPanel({ settings, onUpdateSetting, onClose }: SettingsPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="absolute top-0 right-0 z-50 flex h-full w-80 flex-col bg-paper text-ink shadow-xl">
      <div className="flex items-center justify-between border-b border-rule p-4">
        <h2 className="font-serif font-semibold">{t('settings.title')}</h2>
        <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-black/5">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          <span className="mb-3 block text-sm font-medium">{t('settings.theme.label')}</span>
          <div className="flex gap-2">
            {themes.map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => void onUpdateSetting('theme', value)}
                className={clsx(
                  'flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                  settings.theme === value && 'ring-1 ring-accent',
                  settings.theme !== value && 'opacity-60 ring-rule',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{t(`header.theme.${value}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">
            {t('settings.font_size.label', { size: settings.fontSize })}
          </label>
          <input
            type="range"
            min="12"
            max="32"
            value={settings.fontSize}
            onChange={(e) => void onUpdateSetting('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs opacity-60">
            <span>{t('settings.font_size.small')}</span>
            <span>{t('settings.font_size.large')}</span>
          </div>
        </div>

        <div>
          <span className="mb-3 block text-sm font-medium">{t('settings.font_family.label')}</span>
          <div className="flex gap-2">
            {fontFamilies.map((value) => (
              <button
                key={value}
                onClick={() => void onUpdateSetting('fontFamily', value)}
                className={clsx(
                  'flex-1 rounded-lg border p-3 transition-colors',
                  settings.fontFamily === value && 'ring-1 ring-accent',
                  settings.fontFamily !== value && 'opacity-60 ring-rule',
                  value === 'sans' && 'font-[system-ui,sans-serif]',
                  value === 'serif' && 'font-[Georgia,serif]',
                )}
              >
                {t(`settings.font_family.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">
            {t('settings.line_height.label', { value: settings.lineHeight.toFixed(1) })}
          </label>
          <input
            type="range"
            min="1.2"
            max="2.0"
            step="0.1"
            value={settings.lineHeight}
            onChange={(e) => void onUpdateSetting('lineHeight', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs opacity-60">
            <span>{t('settings.line_height.compact')}</span>
            <span>{t('settings.line_height.spacious')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
