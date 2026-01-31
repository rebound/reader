import { BookOpen, CodeXml, ExternalLink } from 'lucide-react'
import { AppFooter } from '@/components/app-footer.tsx'
import { AppHeader } from '@/components/app-header.tsx'
import { AppShell } from '@/components/app-shell.tsx'

const GITHUB_URL = 'https://github.com/rebound/reader'

const features = [
  'Read EPUB and PDF files',
  'Automatic progress saving',
  'Bookmarks with labels',
  'Table of contents navigation',
  'Light, sepia, and dark themes',
  'Customisable fonts and sizes',
  'Keyboard navigation',
  '100% offline capable',
  'No accounts or sign-ups',
  'All data stays on your device',
]

const notFeatures = [
  'Cloud sync between devices',
  'DRM-protected books',
  'Book store or purchases',
  'Social features or sharing',
]

export default function AboutRoute() {
  return (
    <AppShell>
      <AppHeader />

      <main className="mx-auto max-w-3xl flex-1 px-6 py-10">
        <div className="mb-12 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-accent" />
          <h2 className="mb-3 font-serif text-3xl font-bold">Reader</h2>
          <p className="text-lg text-ink-muted">A simple, private, offline-first ebook reader for your browser.</p>
        </div>

        <section className="mb-10">
          <h3 className="mb-4 font-serif text-xl font-bold">What Reader is</h3>
          <p className="mb-4 leading-relaxed text-ink-muted">
            Reader is a minimalist ebook reader that runs entirely in your browser. Your books are stored locally using
            IndexedDB, which means they never leave your device. No servers, no accounts, no tracking.
          </p>
          <p className="leading-relaxed text-ink-muted">
            It&rsquo;s intended for people who want a clean, distraction-free reading experience without the complexity
            of traditional ebook software or the privacy concerns of cloud-based readers.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="mb-4 font-serif text-xl font-bold">Features</h3>
          <ul className="grid list-inside list-disc gap-2 text-ink-muted sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="list-item">
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h3 className="mb-4 font-serif text-xl font-bold">What Reader is not</h3>
          <p className="mb-4 leading-relaxed text-ink-muted">
            Reader is intentionally simple. It&rsquo;s not trying to replace full-featured apps like Calibre or Kindle.
            Some things it doesn&rsquo;t do:
          </p>
          <ul className="grid list-inside list-disc gap-2 text-ink-muted sm:grid-cols-2">
            {notFeatures.map((feature) => (
              <li key={feature} className="list-item">
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h3 className="mb-4 font-serif text-xl font-bold">Technical notes</h3>
          <ul className="space-y-2 text-ink-muted">
            <li>
              <strong>Storage:</strong> Books are stored in IndexedDB. Storage limits vary by browser but are typically
              generous (hundreds of MB to several GB).
            </li>
            <li>
              <strong>Formats:</strong> EPUB files are rendered using epub.js. PDFs are rendered using pdf.js.
            </li>
            <li>
              <strong>Privacy:</strong> Everything runs client-side. No data is sent anywhere. You can verify this by
              checking the network tab in your browser&rsquo;s dev tools.
            </li>
            <li>
              <strong>Offline:</strong> Once loaded, Reader works completely offline.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h3 className="mb-4 font-serif text-xl font-medium">Links</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-rule px-4 py-2 transition-colors hover:bg-black/5"
            >
              <CodeXml className="h-5 w-5" />
              <span>Source code</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-rule px-4 py-2 transition-colors hover:bg-black/5"
            >
              <span>Report an issue</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <AppFooter />
    </AppShell>
  )
}
