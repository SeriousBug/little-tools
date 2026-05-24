import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { EpubDocument } from './parser';

const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const OPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="id">test</dc:identifier>
    <dc:title>Test Book</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item href="nav.xhtml" id="nav" media-type="application/xhtml+xml" properties="nav"/>
    <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
    <item href="ch1.xhtml" id="ch1" media-type="application/xhtml+xml"/>
    <item href="ch2.xhtml" id="ch2" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
  </spine>
</package>`;

const NAV = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head><title>TOC</title></head>
  <body>
    <nav epub:type="toc">
      <ol>
        <li><a href="ch1.xhtml">Chapter One</a></li>
        <li><a href="ch2.xhtml#start">Chapter Two</a></li>
      </ol>
    </nav>
  </body>
</html>`;

const NCX = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="test"/></head>
  <docTitle><text>Test Book</text></docTitle>
  <navMap>
    <navPoint id="np1" playOrder="1">
      <navLabel><text>Chapter One</text></navLabel>
      <content src="ch1.xhtml"/>
    </navPoint>
    <navPoint id="np2" playOrder="2">
      <navLabel><text>Chapter Two</text></navLabel>
      <content src="ch2.xhtml#start"/>
    </navPoint>
  </navMap>
</ncx>`;

const CH1 = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Chapter 1</title></head>
  <body>
    <h1>The Real Title of Chapter 1</h1>
    <p>Some content.</p>
  </body>
</html>`;

const CH2 = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Chapter 2</title></head>
  <body>
    <div id="other"><h2>Wrong Heading</h2></div>
    <div id="start"><h2>The Real Title of Chapter 2</h2><p>Hi.</p></div>
  </body>
</html>`;

async function makeTestEpub(): Promise<File> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', CONTAINER_XML);
  zip.file('OEBPS/content.opf', OPF);
  zip.file('OEBPS/nav.xhtml', NAV);
  zip.file('OEBPS/toc.ncx', NCX);
  zip.file('OEBPS/ch1.xhtml', CH1);
  zip.file('OEBPS/ch2.xhtml', CH2);
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  return new File([blob], 'test.epub', { type: 'application/epub+zip' });
}

describe('EpubDocument', () => {
  it('parses chapters from the nav TOC', async () => {
    const file = await makeTestEpub();
    const doc = await EpubDocument.load(file, file.name);
    expect(doc.chapters).toHaveLength(2);
    expect(doc.chapters[0].title).toBe('Chapter One');
    expect(doc.chapters[1].title).toBe('Chapter Two');
    expect(doc.chapters[0].href).toBe('ch1.xhtml');
    expect(doc.chapters[1].href).toBe('ch2.xhtml#start');
  });

  it('reads chapter headings from chapter content', async () => {
    const file = await makeTestEpub();
    const doc = await EpubDocument.load(file, file.name);
    const heading1 = await doc.getChapterHeading(doc.chapters[0].id);
    const heading2 = await doc.getChapterHeading(doc.chapters[1].id);
    expect(heading1).toBe('The Real Title of Chapter 1');
    expect(heading2).toBe('The Real Title of Chapter 2');
  });

  it('updates titles and produces a saveable epub', async () => {
    const file = await makeTestEpub();
    const doc = await EpubDocument.load(file, file.name);

    doc.applyTitles({
      [doc.chapters[0].id]: 'New Title One',
      [doc.chapters[1].id]: 'New Title Two',
    });

    const blob = await doc.generateBlob();
    expect(blob.size).toBeGreaterThan(0);

    const reloaded = await EpubDocument.load(blob, 'reloaded.epub');
    expect(reloaded.chapters[0].title).toBe('New Title One');
    expect(reloaded.chapters[1].title).toBe('New Title Two');
  });

  it('also updates the ncx when nav is the primary', async () => {
    const file = await makeTestEpub();
    const doc = await EpubDocument.load(file, file.name);
    doc.applyTitles({ [doc.chapters[0].id]: 'Renamed' });
    const blob = await doc.generateBlob();

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const ncxText = await zip.file('OEBPS/toc.ncx')!.async('string');
    expect(ncxText).toContain('Renamed');
  });

  it('rejects non-EPUB zip files', async () => {
    const zip = new JSZip();
    zip.file('hello.txt', 'world');
    const blob = await zip.generateAsync({ type: 'blob' });
    const file = new File([blob], 'not.epub');
    await expect(EpubDocument.load(file, file.name)).rejects.toThrow(/container\.xml/);
  });
});
