import fs from 'node:fs/promises';
import type { Plugin } from 'vite';

const ICON_QUERY = 'icon';

function recolor(svg: string): string {
  return svg
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(
      /stroke:\s*(black|#000000|#000|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))/gi,
      'stroke:currentColor'
    )
    .replace(/fill:\s*(black|#000000|#000|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))/gi, 'fill:currentColor')
    .replace(/stroke="(black|#000000|#000)"/gi, 'stroke="currentColor"')
    .replace(/fill="(black|#000000|#000)"/gi, 'fill="currentColor"')
    .replace(/<svg\b(?![^>]*\bfill=)([^>]*)>/, '<svg fill="currentColor"$1>')
    .trim();
}

export function svgIcon(): Plugin {
  return {
    name: 'svg-icon',
    enforce: 'pre',
    async load(id) {
      const [file, query = ''] = id.split('?');
      if (!file.endsWith('.svg')) return null;
      if (!query.split('&').includes(ICON_QUERY)) return null;
      const raw = await fs.readFile(file, 'utf8');
      const transformed = recolor(raw);
      return `export default ${JSON.stringify(transformed)};`;
    },
  };
}
