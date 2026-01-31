import { useTranslation } from 'react-i18next'

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-6xl px-6 py-4 text-center text-sm opacity-50">{t('footer.tagline')}</div>
    </footer>
  )
}
