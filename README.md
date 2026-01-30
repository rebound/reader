# Offline Reader

A privacy-first EPUB and PDF reader that runs entirely in your browser. No accounts, no cloud storage, no tracking.

## Features

- **100% Offline**: PWA with service worker - works without internet after first load
- **EPUB & PDF Support**: Full rendering with epub.js and pdf.js
- **Reading Progress**: Automatically saves your position (IndexedDB)
- **Bookmarks**: Mark and return to important pages
- **Table of Contents**: Navigate chapters easily
- **E-reader Themes**: Light, Sepia (default), and Dark modes
- **Font Controls**: Adjust size and font family for EPUBs
- **Zoom**: Scale PDFs for comfortable reading
- **Keyboard Navigation**: Arrow keys for page turns

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Open the app in your browser
2. Drag and drop EPUB or PDF files, or click "Import"
3. Click a book cover to start reading
4. Use the sidebar (menu icon) for ToC and bookmarks
5. Use the settings (gear icon) to change theme/font

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- epub.js (EPUB rendering)
- pdf.js (PDF rendering)
- Dexie (IndexedDB wrapper)
- vite-plugin-pwa (Service worker + installable PWA)

## PWA / Offline Support

The app is a full Progressive Web App:
- **Installable**: Add to home screen on mobile or desktop
- **Offline-first**: Service worker caches all assets after first load
- **Auto-updates**: New versions load in background

After visiting once, the app works completely offline - no internet required.

## Privacy

Your books and reading data never leave your device. Everything is stored in your browser's IndexedDB.
