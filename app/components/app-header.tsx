import { BookOpen, Coffee, Info, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useSettings } from '@/hooks/use-settings.ts'
import type { Theme } from '@/hooks/use-settings.ts'
import type { ReactNode } from 'react'

type AppHeaderProps = {
  actions?: ReactNode
}

const themes: Theme[] = ['light', 'sepia', 'dark']

export function AppHeader({ actions }: AppHeaderProps) {
  const { t } = useTranslation()
  const { settings, updateSetting } = useSettings()

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    void updateSetting('theme', themes[nextIndex])
  }

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'sepia' ? Coffee : Sun
  const themeName = t(`header.theme.${settings.theme}`)

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-accent" />
          <span className="font-serif text-2xl font-semibold">{t('app.name')}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            aria-label={t('header.about.label')}
          >
            <Info className="h-5 w-5" />
          </Link>

          <button
            onClick={cycleTheme}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            aria-label={t('header.theme.label', { theme: themeName })}
          >
            <ThemeIcon className="h-5 w-5" />
          </button>

          {actions}
        </div>
      </div>
    </header>
  )
}
