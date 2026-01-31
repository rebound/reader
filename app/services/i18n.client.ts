import { createInstance } from 'i18next'
import languageDetector from 'i18next-browser-languagedetector'
import backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

export const i18n = createInstance()

void i18n
  .use(backend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en'],
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    contextSeparator: '|',
    saveMissing: true,
    react: {
      useSuspense: true,
    },
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      const msg = `Missing translation key - [${lng.join()}] ${ns}:${key} (${fallbackValue})`

      console.warn(msg)
    },
  })

i18n.services.formatter?.addCached('number', (lng, opts?: Intl.NumberFormatOptions) => {
  const formatter = new Intl.NumberFormat(lng, opts)

  return (val: number) => formatter.format(val)
})
