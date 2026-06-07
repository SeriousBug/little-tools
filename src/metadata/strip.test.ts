import { describe, it, expect } from 'vitest';
import { stripMetadata } from './strip';

function createJpegWithExif(): ArrayBuffer {
  const soi = [0xff, 0xd8];
  const app0 = [
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
  ];
  const app1 = [
    0xff, 0xe1, 0x00, 0x0e, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x00, 0x00,
  ];
  const app13 = [
    0xff, 0xed, 0x00, 0x0c, 0x50, 0x68, 0x6f, 0x74, 0x6f, 0x73, 0x68, 0x6f, 0x70, 0x00,
  ];
  const com = [0xff, 0xfe, 0x00, 0x0a, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x00, 0x00];
  const dqt = [
    0xff, 0xdb, 0x00, 0x43, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x01,
  ];
  const eoi = [0xff, 0xd9];

  const bytes = [...soi, ...app0, ...app1, ...app13, ...com, ...dqt, ...eoi];
  return new Uint8Array(bytes).buffer;
}

function createPngWithTextChunks(): ArrayBuffer {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];

  function chunk(type: string, data: number[]): number[] {
    const length = data.length;
    const lenBytes = [
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    ];
    const typeBytes = [...new TextEncoder().encode(type)];
    const all = [...lenBytes, ...typeBytes, ...data];

    let crc = 0xffffffff;
    for (let i = 4; i < all.length; i++) {
      crc ^= all[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) crc = (crc >>> 1) ^ 0xedb88320;
        else crc >>>= 1;
      }
    }
    crc ^= 0xffffffff;
    const crcBytes = [(crc >> 24) & 0xff, (crc >> 16) & 0xff, (crc >> 8) & 0xff, crc & 0xff];

    return [...all, ...crcBytes];
  }

  const ihdr = chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]);
  const text = chunk('tEXt', [...new TextEncoder().encode('key\0value')]);
  const ztxt = chunk('zTXt', [...new TextEncoder().encode('key'), 0, 0x78, 0xda, 0x01, 0x02, 0x03]);
  const itxt = chunk('iTXt', [...new TextEncoder().encode('key\0\0\0en\0\0value')]);
  const time = chunk('tIME', [0x07, 0xe5, 0x01, 0x01, 0x00, 0x00, 0x00]);
  const exif = chunk('eXIf', [0x01, 0x02, 0x03, 0x04]);
  const idat = chunk('IDAT', [0x78, 0x01, 0x01, 0x00, 0x00, 0xff, 0xff]);
  const iend = chunk('IEND', []);

  const bytes = [...sig, ...ihdr, ...text, ...ztxt, ...itxt, ...time, ...exif, ...idat, ...iend];
  return new Uint8Array(bytes).buffer;
}

describe('stripMetadata', () => {
  it('removes APP1, APP13, and COM segments from JPEG', () => {
    const input = createJpegWithExif();
    const result = stripMetadata(input, 'image/jpeg');
    const bytes = new Uint8Array(result);

    const soi = bytes[0] === 0xff && bytes[1] === 0xd8;
    expect(soi).toBe(true);

    let hasApp1 = false;
    let hasApp13 = false;
    let hasCom = false;
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) hasApp1 = true;
      if (bytes[i] === 0xff && bytes[i + 1] === 0xed) hasApp13 = true;
      if (bytes[i] === 0xff && bytes[i + 1] === 0xfe) hasCom = true;
    }

    expect(hasApp1).toBe(false);
    expect(hasApp13).toBe(false);
    expect(hasCom).toBe(false);

    const eoi = bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
    expect(eoi).toBe(true);
  });

  it('preserves APP0 and DQT segments in JPEG', () => {
    const input = createJpegWithExif();
    const result = stripMetadata(input, 'image/jpeg');
    const bytes = new Uint8Array(result);

    let hasApp0 = false;
    let hasDqt = false;
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe0) hasApp0 = true;
      if (bytes[i] === 0xff && bytes[i + 1] === 0xdb) hasDqt = true;
    }

    expect(hasApp0).toBe(true);
    expect(hasDqt).toBe(true);
  });

  it('removes text, time, and exif chunks from PNG', () => {
    const input = createPngWithTextChunks();
    const result = stripMetadata(input, 'image/png');
    const bytes = new Uint8Array(result);

    const sig = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    expect(sig).toBe(true);

    const chunkTypes: string[] = [];
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const type = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7]
      );
      chunkTypes.push(type);
      const length =
        (bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3];
      offset += 12 + length;
      if (type === 'IEND') break;
    }

    expect(chunkTypes).not.toContain('tEXt');
    expect(chunkTypes).not.toContain('zTXt');
    expect(chunkTypes).not.toContain('iTXt');
    expect(chunkTypes).not.toContain('tIME');
    expect(chunkTypes).not.toContain('eXIf');
    expect(chunkTypes).toContain('IHDR');
    expect(chunkTypes).toContain('IDAT');
    expect(chunkTypes).toContain('IEND');
  });

  it('produces smaller buffer for JPEG after stripping', () => {
    const input = createJpegWithExif();
    const result = stripMetadata(input, 'image/jpeg');
    expect(result.byteLength).toBeLessThan(input.byteLength);
  });

  it('produces smaller buffer for PNG after stripping', () => {
    const input = createPngWithTextChunks();
    const result = stripMetadata(input, 'image/png');
    expect(result.byteLength).toBeLessThan(input.byteLength);
  });

  it('returns original buffer for unsupported types', () => {
    const input = new Uint8Array([1, 2, 3, 4]).buffer;
    const result = stripMetadata(input, 'image/avif');
    expect(result).toBe(input);
  });

  it('returns original buffer for invalid JPEG', () => {
    const input = new Uint8Array([0x00, 0x00, 0x01, 0x02, 0x03]).buffer;
    const result = stripMetadata(input, 'image/jpeg');
    expect(result).toBe(input);
  });
});
