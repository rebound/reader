import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWA() {
  useRegisterSW({
    immediate: true,
    onRegisteredSW: async (url, registration) => {
      if (!registration || registration.installing) return
      if ('connection' in globalThis.navigator && !globalThis.navigator.onLine) return

      const response = await globalThis.fetch(url)

      if (response.ok) {
        void registration.update()
      }
    },
  })

  return null
}
