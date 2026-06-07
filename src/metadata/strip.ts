const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const PNG_SKIP_CHUNKS = new Set(['tEXt', 'zTXt', 'iTXt', 'tIME', 'eXIf']);

const JPEG_SKIP_MARKERS = new Set<number>([
  0xe1, // APP1 — EXIF, XMP
  0xed, // APP13 — IPTC / Photoshop
  0xfe, // COM — comment
]);

function concatParts(parts: Uint8Array[]): ArrayBuffer {
  const totalLength = parts.reduce((sum, p) => sum + p.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    result.set(part, pos);
    pos += part.byteLength;
  }
  return result.buffer;
}

function stripJpeg(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  const parts: Uint8Array[] = [];
  let offset = 0;

  if (buffer.byteLength < 2 || view.getUint8(0) !== 0xff || view.getUint8(1) !== 0xd8) {
    return buffer;
  }

  while (offset < buffer.byteLength) {
    if (offset >= buffer.byteLength) break;

    if (view.getUint8(offset) !== 0xff) {
      parts.push(new Uint8Array(buffer.slice(offset, offset + 1)));
      offset++;
      continue;
    }

    if (offset + 1 >= buffer.byteLength) break;
    const marker = view.getUint8(offset + 1);

    if (marker >= 0xd0 && marker <= 0xd9) {
      parts.push(new Uint8Array(buffer.slice(offset, offset + 2)));
      offset += 2;
      if (marker === 0xd9) break;
      continue;
    }

    if (offset + 4 > buffer.byteLength) break;
    const length = view.getUint16(offset + 2, false);

    if (JPEG_SKIP_MARKERS.has(marker)) {
      offset += 2 + length;
      continue;
    }

    if (marker === 0xda) {
      const headerEnd = offset + 2 + length;
      parts.push(new Uint8Array(buffer.slice(offset, headerEnd)));
      offset = headerEnd;
      while (offset < buffer.byteLength) {
        if (view.getUint8(offset) === 0xff) {
          const next = offset + 1 < buffer.byteLength ? view.getUint8(offset + 1) : 0;
          if (next !== 0x00 && !(next >= 0xd0 && next <= 0xd7)) {
            break;
          }
        }
        parts.push(new Uint8Array(buffer.slice(offset, offset + 1)));
        offset++;
      }
      continue;
    }

    parts.push(new Uint8Array(buffer.slice(offset, offset + 2 + length)));
    offset += 2 + length;
  }

  return concatParts(parts);
}

function stripPng(buffer: ArrayBuffer): ArrayBuffer {
  if (buffer.byteLength < 8) return buffer;
  const sig = new Uint8Array(buffer.slice(0, 8));
  if (!PNG_SIGNATURE.every((b, i) => b === sig[i])) return buffer;

  const parts: Uint8Array[] = [];
  parts.push(new Uint8Array(buffer.slice(0, 8)));

  let offset = 8;
  const view = new DataView(buffer);

  while (offset + 12 <= buffer.byteLength) {
    const length = view.getUint32(offset, false);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );

    const chunkSize = 12 + length;

    if (offset + chunkSize > buffer.byteLength) break;

    if (PNG_SKIP_CHUNKS.has(type)) {
      offset += chunkSize;
      continue;
    }

    parts.push(new Uint8Array(buffer.slice(offset, offset + chunkSize)));
    offset += chunkSize;

    if (type === 'IEND') break;
  }

  return concatParts(parts);
}

export function stripMetadata(buffer: ArrayBuffer, type: string): ArrayBuffer {
  if (type === 'image/jpeg') return stripJpeg(buffer);
  if (type === 'image/png') return stripPng(buffer);
  return buffer;
}
