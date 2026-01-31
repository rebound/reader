import { index, layout, route } from '@react-router/dev/routes'
import type { RouteConfig } from '@react-router/dev/routes'

export default [
  layout('./layouts/page.tsx', [
    index('./routes/library.tsx'),
    route('book/:bookId', './routes/book.tsx'),
    route('about', './routes/about.tsx'),
  ]),
] satisfies RouteConfig
