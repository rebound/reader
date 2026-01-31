# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reader is an offline-first EPUB and PDF reader built as a PWA. All book data is stored locally in IndexedDB using Dexie. The app is built with React Router v7 (SPA mode, no SSR) and uses the React Compiler for automatic memoization.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint on app/
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # Type check (runs typegen first)
npm run format       # Format with Prettier
```

## Architecture

### Data Layer
- **IndexedDB via Dexie** (`app/utilities/db.ts`): Four tables - `books`, `progress`, `bookmarks`, `settings`
- Books store the full file as `ArrayBuffer` in `fileData` field
- Progress tracking uses CFI strings for EPUB, page numbers for PDF

### Routing
- SPA mode (`ssr: false` in react-router.config.ts)
- Routes: `/` (library), `/book/:bookId` (reader), `/about`
- Book IDs in URLs are the `key` field (nanoid), not the numeric `id`

### Reader Components
- `EpubReader`: Uses epub.js via `useEpubReader` hook for rendering
- `PdfReader`: Uses pdf.js via `usePdfDocument` hook with TanStack Query for caching
- Both support bookmarks, progress persistence, and theming

### Theming
- CSS custom properties in `app/styles/main.css`
- Three themes: `light`, `sepia`, `dark`
- Set via `data-theme` attribute on `<html>`
- Theme colors: `--paper`, `--ink`, `--ink-muted`, `--accent`, `--rule`

### Key Patterns
- Hooks for data access: `useBooks`, `useProgress`, `useBookmarks`, `useSettings`
- `useLiveQuery` (Dexie) for reactive IndexedDB subscriptions
- TanStack Query for PDF document caching
- i18n via react-i18next (translations loaded from backend)

## Code Style

- File extensions required in imports (enforced by ESLint)
- Type imports must be separate (`import type { X }`)
- Use `type` keyword for type definitions, not `interface`
- Path alias: `@/` maps to `app/`
- Pre-commit hook runs ESLint on staged files
