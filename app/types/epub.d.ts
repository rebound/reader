declare module 'epubjs' {
  export type NavItem = {
    id: string
    href: string
    label: string
    subitems?: NavItem[]
    parent?: string
  }

  export type Navigation = {
    toc: NavItem[]
    landmarks: NavItem[]
  }

  export type Location = {
    start: {
      index: number
      href: string
      cfi: string
      displayed: {
        page: number
        total: number
      }
    }
    end: {
      index: number
      href: string
      cfi: string
      displayed: {
        page: number
        total: number
      }
    }
    atStart: boolean
    atEnd: boolean
  }

  export type Rendition = {
    display(target?: string): Promise<void>
    prev(): Promise<void>
    next(): Promise<void>
    destroy(): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
    themes: {
      register(name: string, styles: Record<string, unknown>): void
      select(name: string): void
      fontSize(size: string): void
    }
    hooks: {
      content: {
        register(callback: (contents: unknown) => void): void
      }
    }
  }

  export type Locations = {
    generate(chars: number): Promise<string[]>
    percentageFromCfi(cfi: string): number
    length(): number
  }

  export type Book = {
    loaded: {
      navigation: Promise<Navigation>
      metadata: Promise<unknown>
    }
    ready: Promise<void>
    locations: Locations
    renderTo(
      element: HTMLElement,
      options?: {
        width?: string | number
        height?: string | number
        spread?: 'none' | 'always' | 'auto'
        flow?: 'paginated' | 'scrolled' | 'scrolled-doc'
        allowScriptedContent?: boolean
      },
    ): Rendition
    destroy(): void
    coverUrl(): Promise<string | null>
  }

  export default function ePub(data: ArrayBuffer | string): Book
}
