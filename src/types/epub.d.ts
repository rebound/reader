declare module 'epubjs' {
  export interface NavItem {
    id: string;
    href: string;
    label: string;
    subitems?: NavItem[];
  }

  export interface PackagingMetadataObject {
    title: string;
    creator: string;
    description: string;
    pubdate: string;
    publisher: string;
    identifier: string;
    language: string;
    rights: string;
    modified_date: string;
    layout: string;
    orientation: string;
    flow: string;
    viewport: string;
    spread: string;
  }

  export interface Location {
    start: {
      cfi: string;
      displayed: {
        page: number;
        total: number;
      };
      href: string;
      index: number;
      location: number;
      percentage: number;
    };
    end: {
      cfi: string;
      displayed: {
        page: number;
        total: number;
      };
      href: string;
      index: number;
      location: number;
      percentage: number;
    };
    atStart: boolean;
    atEnd: boolean;
  }

  export interface Rendition {
    display(target?: string): Promise<void>;
    prev(): Promise<void>;
    next(): Promise<void>;
    destroy(): void;
    on(event: string, callback: (data: Location) => void): void;
    off(event: string, callback: (data: Location) => void): void;
    themes: {
      register(name: string, styles: Record<string, Record<string, string>>): void;
      select(name: string): void;
      fontSize(size: string): void;
    };
  }

  export interface Locations {
    generate(chars: number): Promise<string[]>;
    percentageFromCfi(cfi: string): number;
    length(): number;
  }

  export interface Book {
    ready: Promise<void>;
    loaded: {
      metadata: Promise<PackagingMetadataObject>;
      navigation: Promise<{ toc: NavItem[] }>;
    };
    locations: Locations;
    renderTo(
      element: HTMLElement,
      options?: {
        width?: string | number;
        height?: string | number;
        spread?: string;
        flow?: string;
      }
    ): Rendition;
    coverUrl(): Promise<string | null>;
    destroy(): void;
  }

  function ePub(data: ArrayBuffer | string): Book;
  export default ePub;
}
