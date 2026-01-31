# Reader

A privacy-first EPUB and PDF reader that runs entirely offline. All book data stays on your device in IndexedDB with no servers, no tracking, no accounts.

## Features

- **100% Offline**: Works without internet after first load; installable as a PWA
- **EPUB & PDF Support**: Full rendering via epub.js and pdf.js
- **Reading Progress**: Automatically saves your position (CFI for EPUB, page number for PDF)
- **Bookmarks**: Mark and jump to saved locations
- **Themes**: Light, sepia, and dark reading modes
- **i18n**: Internationalization support via react-i18next

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command             | Description              |
|---------------------|--------------------------|
| `npm run dev`       | Start development server |
| `npm run build`     | Production build         |
| `npm run lint`      | Run ESLint               |
| `npm run lint:fix`  | Auto-fix lint issues     |
| `npm run typecheck` | Type check with typegen  |
| `npm run format`    | Format with Prettier     |

## Tech Stack

- **React 19** with React Compiler for automatic memoization
- **React Router v7** (SPA mode, no SSR)
- **Dexie** (IndexedDB wrapper) for offline storage
- **TanStack Query** for PDF document caching
- **Tailwind CSS v4** for styling
- **Vite** with PWA plugin

## Architecture

```
app/
├── components/      # UI components (readers, sidebar, settings)
├── hooks/           # Data hooks (useBooks, useProgress, useSettings)
├── layouts/         # Page layout wrapper
├── routes/          # Route components (library, book, about)
├── services/        # i18n and query client setup
├── styles/          # CSS with theme variables
└── utilities/       # Database schema (db.ts), file utilities
```

### Data Model

Four IndexedDB tables via Dexie:

- **books**: Stores title, author, type, full file as `ArrayBuffer`, cover image
- **progress**: Reading position (CFI string or page number) per book
- **bookmarks**: User-created bookmarks with labels
- **settings**: Key-value pairs for user preferences

### Theming

CSS custom properties set via `data-theme` attribute on `<html>`:

| Variable      | Purpose              |
|---------------|----------------------|
| `--paper`     | Background color     |
| `--ink`       | Primary text color   |
| `--ink-muted` | Secondary text color |
| `--accent`    | Links and highlights |
| `--rule`      | Borders and dividers |

## License

MIT
