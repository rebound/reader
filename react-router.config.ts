import type { Config } from '@react-router/dev/config'
import 'react-router'

export default {
  ssr: false,
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    unstable_optimizeDeps: true,
  },
} satisfies Config
