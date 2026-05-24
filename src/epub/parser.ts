import JSZip from 'jszip';

export interface Chapter {
  id: string;
  title: string;
  /** Original href as it appears in the TOC, relative to the TOC's directory. */
  href: string;
}

interface NavEntry {
  title: string;
  href: string;
  linkElement: Element;
}

interface NcxEntry {
  title: string;
  href: string;
  textElement: Element;
}

interface ChapterInternal extends Chapter {
  navLink?: Element;
  ncxText?: Element;
}

const NS = {
  epub: 'http://www.idpf.org/2007/ops',
} as const;

function dirname(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? '' : path.substring(0, idx);
}

function resolvePath(baseDir: string, relativePath: string): string {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith('/')) return relativePath.substring(1);
  const combined = baseDir ? baseDir + '/' + relativePath : relativePath;
  const parts = combined.split('/');
  const result: string[] = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') result.pop();
    else result.push(part);
  }
  return result.join('/');
}

function getDirectChildren(parent: Element, localName: string): Element[] {
  const result: Element[] = [];
  for (const child of Array.from(parent.children)) {
    if (child.localName === localName) result.push(child);
  }
  return result;
}

/**
 * Walks the descendants of an element (or document root) and collects elements
 * matching localName, regardless of namespace. This is more reliable across
 * environments than getElementsByTagNameNS('*', ...), which doesn't behave
 * consistently between browsers and DOM emulators like happy-dom.
 */
function getAllByLocalName(root: Document | Element, localName: string): Element[] {
  const result: Element[] = [];
  const start: Element | null = root instanceof Document ? root.documentElement : root;
  if (!start) return result;
  const stack: Element[] = [start];
  while (stack.length) {
    const el = stack.pop()!;
    if (el.localName === localName) result.push(el);
    const children = el.children;
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }
  return result;
}

function findElementByIdInXml(doc: Document, id: string): Element | null {
  if (!id) return null;
  try {
    return doc.querySelector(`[id="${CSS.escape(id)}"]`);
  } catch {
    const all = Array.from(doc.getElementsByTagName('*'));
    for (const el of all) {
      if (el.getAttribute('id') === id) return el;
    }
    return null;
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

function parseXml(text: string, mimeType: 'application/xml' | 'application/xhtml+xml'): Document {
  const doc = new DOMParser().parseFromString(text, mimeType);
  const parserError = doc.getElementsByTagName('parsererror');
  if (parserError.length > 0) {
    throw new Error(`Failed to parse XML: ${parserError[0].textContent ?? 'unknown error'}`);
  }
  return doc;
}

function serializeWithDeclaration(serializer: XMLSerializer, doc: Document): string {
  let result = serializer.serializeToString(doc);
  if (!result.startsWith('<?xml')) {
    result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result;
  }
  return result;
}

function collectNavPoints(parent: Element): NcxEntry[] {
  const result: NcxEntry[] = [];
  for (const child of Array.from(parent.children)) {
    if (child.localName !== 'navPoint') continue;
    const navLabel = getDirectChildren(child, 'navLabel')[0];
    const textEl = navLabel ? getDirectChildren(navLabel, 'text')[0] : undefined;
    const content = getDirectChildren(child, 'content')[0];
    if (textEl && content) {
      result.push({
        title: textEl.textContent ?? '',
        href: content.getAttribute('src') ?? '',
        textElement: textEl,
      });
    }
    result.push(...collectNavPoints(child));
  }
  return result;
}

function extractNcxEntries(ncxDoc: Document): NcxEntry[] {
  const navMap = getDirectChildren(ncxDoc.documentElement, 'navMap')[0];
  if (!navMap) return [];
  return collectNavPoints(navMap);
}

function extractNavEntries(navDoc: Document): NavEntry[] {
  const navs = getAllByLocalName(navDoc, 'nav');
  const tocNav =
    navs.find((n) => {
      const t = n.getAttributeNS(NS.epub, 'type') ?? n.getAttribute('epub:type');
      return t === 'toc';
    }) ?? navs[0];
  if (!tocNav) return [];
  const links = getAllByLocalName(tocNav, 'a');
  return links.map((a) => ({
    title: (a.textContent ?? '').trim(),
    href: a.getAttribute('href') ?? '',
    linkElement: a,
  }));
}

export class EpubDocument {
  readonly filename: string;
  chapters: Chapter[];

  private zip: JSZip;
  private navPath?: string;
  private navDoc?: Document;
  private ncxPath?: string;
  private ncxDoc?: Document;
  private internalChapters: ChapterInternal[];

  private constructor(init: {
    filename: string;
    zip: JSZip;
    navPath?: string;
    navDoc?: Document;
    ncxPath?: string;
    ncxDoc?: Document;
    chapters: ChapterInternal[];
  }) {
    this.filename = init.filename;
    this.zip = init.zip;
    this.navPath = init.navPath;
    this.navDoc = init.navDoc;
    this.ncxPath = init.ncxPath;
    this.ncxDoc = init.ncxDoc;
    this.internalChapters = init.chapters;
    this.chapters = init.chapters.map((c) => ({ id: c.id, title: c.title, href: c.href }));
  }

  static async load(file: File | Blob, filename: string): Promise<EpubDocument> {
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);

    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Not a valid EPUB: missing META-INF/container.xml');
    }
    const containerText = await containerFile.async('string');
    const containerDoc = parseXml(containerText, 'application/xml');
    const rootfile = containerDoc.getElementsByTagName('rootfile')[0];
    const opfPath = rootfile?.getAttribute('full-path');
    if (!opfPath) {
      throw new Error('Not a valid EPUB: container.xml missing rootfile path');
    }

    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error(`Not a valid EPUB: missing OPF file at ${opfPath}`);
    }
    const opfText = await opfFile.async('string');
    const opfDoc = parseXml(opfText, 'application/xml');
    const opfDir = dirname(opfPath);

    let navPath: string | undefined;
    let ncxPath: string | undefined;

    const manifestItems = getAllByLocalName(opfDoc, 'item');
    for (const item of manifestItems) {
      const href = item.getAttribute('href');
      if (!href) continue;
      const props = item.getAttribute('properties');
      if (props && props.split(/\s+/).includes('nav')) {
        navPath = resolvePath(opfDir, href);
      }
      if (item.getAttribute('media-type') === 'application/x-dtbncx+xml') {
        ncxPath = resolvePath(opfDir, href);
      }
    }

    if (!ncxPath) {
      const spine = getAllByLocalName(opfDoc, 'spine')[0];
      const spineToc = spine?.getAttribute('toc');
      if (spineToc) {
        const ncxItem = manifestItems.find((i) => i.getAttribute('id') === spineToc);
        const href = ncxItem?.getAttribute('href');
        if (href) ncxPath = resolvePath(opfDir, href);
      }
    }

    let navDoc: Document | undefined;
    let navEntries: NavEntry[] = [];
    if (navPath) {
      const f = zip.file(navPath);
      if (f) {
        const text = await f.async('string');
        navDoc = parseXml(text, 'application/xhtml+xml');
        navEntries = extractNavEntries(navDoc);
      } else {
        navPath = undefined;
      }
    }

    let ncxDoc: Document | undefined;
    let ncxEntries: NcxEntry[] = [];
    if (ncxPath) {
      const f = zip.file(ncxPath);
      if (f) {
        const text = await f.async('string');
        ncxDoc = parseXml(text, 'application/xml');
        ncxEntries = extractNcxEntries(ncxDoc);
      } else {
        ncxPath = undefined;
      }
    }

    let chapters: ChapterInternal[];
    if (navEntries.length > 0) {
      chapters = navEntries.map((e, i) => {
        const matching =
          ncxEntries.find((n) => n.href === e.href) ??
          (i < ncxEntries.length ? ncxEntries[i] : undefined);
        return {
          id: generateId(),
          title: e.title,
          href: e.href,
          navLink: e.linkElement,
          ncxText: matching?.textElement,
        };
      });
    } else {
      chapters = ncxEntries.map((e) => ({
        id: generateId(),
        title: e.title,
        href: e.href,
        ncxText: e.textElement,
      }));
    }

    if (chapters.length === 0) {
      throw new Error('No chapters found in the EPUB table of contents.');
    }

    return new EpubDocument({
      filename,
      zip,
      navPath,
      navDoc,
      ncxPath,
      ncxDoc,
      chapters,
    });
  }

  /**
   * For a given chapter (referenced by id), open its content file and return the
   * first heading's text, or null if none can be found.
   */
  async getChapterHeading(chapterId: string): Promise<string | null> {
    const chapter = this.internalChapters.find((c) => c.id === chapterId);
    if (!chapter) return null;

    const tocPath = this.navPath ?? this.ncxPath;
    if (!tocPath) return null;
    const tocDir = dirname(tocPath);

    const [path, fragment] = chapter.href.split('#');
    if (!path) return null;
    const fullPath = resolvePath(tocDir, path);
    const file = this.zip.file(fullPath);
    if (!file) return null;

    const text = await file.async('string');
    const doc = parseXml(text, 'application/xhtml+xml');

    let startElement: Element = doc.documentElement;
    if (fragment) {
      const idEl = findElementByIdInXml(doc, fragment);
      if (idEl) startElement = idEl;
    }

    for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      const headings = getAllByLocalName(startElement, tag);
      if (headings.length > 0) {
        const heading = headings[0].textContent?.replace(/\s+/g, ' ').trim();
        if (heading) return heading;
      }
    }

    if (fragment) {
      for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
        const headings = getAllByLocalName(doc, tag);
        for (const h of headings) {
          if (
            startElement === h ||
            startElement.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING
          ) {
            const heading = h.textContent?.replace(/\s+/g, ' ').trim();
            if (heading) return heading;
          }
        }
      }
    }

    return null;
  }

  /**
   * Update the cached chapter titles. The next call to generateBlob will use these.
   */
  applyTitles(titles: Record<string, string>): void {
    for (const c of this.internalChapters) {
      if (titles[c.id] !== undefined) {
        c.title = titles[c.id];
      }
    }
    this.chapters = this.internalChapters.map((c) => ({
      id: c.id,
      title: c.title,
      href: c.href,
    }));
  }

  async generateBlob(): Promise<Blob> {
    for (const c of this.internalChapters) {
      if (c.navLink) {
        c.navLink.textContent = c.title;
      }
      if (c.ncxText) {
        c.ncxText.textContent = c.title;
      }
    }

    const serializer = new XMLSerializer();
    if (this.navDoc && this.navPath) {
      this.zip.file(this.navPath, serializeWithDeclaration(serializer, this.navDoc));
    }
    if (this.ncxDoc && this.ncxPath) {
      this.zip.file(this.ncxPath, serializeWithDeclaration(serializer, this.ncxDoc));
    }

    // The EPUB spec requires the mimetype file to be stored uncompressed.
    this.zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    return await this.zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }
}
