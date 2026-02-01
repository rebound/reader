import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import babel from 'vite-plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    sourcemap: false,
    emptyOutDir: true,
    cssMinify: 'lightningcss',
    modulePreload: { polyfill: false },
    rolldownOptions: {
      output: {
        chunkFileNames: 'assets/chunk-[hash:8].js',
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    babel({
      filter: /\.[jt]sx?$/,
      enforce: 'pre',
      loader: 'jsx',
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      includeAssets: ['*.png', '*.ico', '*.json'],
      outDir: 'build/client',
      manifest: {
        name: 'Reader',
        short_name: 'Reader',
        description: 'A free privacy-first EPUB and PDF reader - 100% offline',
        theme_color: '#f4ecd8',
        background_color: '#f4ecd8',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,mjs,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
      },
    }),
  ],
})
