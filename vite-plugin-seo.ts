import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { Plugin } from 'vite';
import { Resvg } from '@resvg/resvg-js';
import { SITE_URL, TOOLS, type Tool } from './src/tools';

const SEO_BLOCK_START = '<!-- SEO:META -->';
const SEO_BLOCK_END = '<!-- /SEO:META -->';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Naive width-based word wrap for SVG text.
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (last.length > maxChars) {
      lines[maxLines - 1] = last.slice(0, maxChars - 1) + '…';
    }
  }
  return lines;
}

function buildOgSvg(tool: Tool): string {
  const headline = escapeXml(tool.ogHeadline);
  const sublineLines = wrap(tool.ogSubline, 56, 3).map(escapeXml);
  const host = escapeXml(SITE_URL.replace(/^https?:\/\//, ''));

  const sublineTSpans = sublineLines
    .map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 56}">${line}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111c33"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="630" fill="#22d3ee"/>
  <text x="80" y="120" fill="#22d3ee" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="600" letter-spacing="2">LITTLE TOOLS</text>
  <text x="80" y="290" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="84" font-weight="700">${headline}</text>
  <text x="80" y="380" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="400">${sublineTSpans}</text>
  <text x="80" y="570" fill="#64748b" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="500">${host}</text>
  <text x="1120" y="570" fill="#64748b" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="500" text-anchor="end">free · private · open source</text>
</svg>`;
}

function renderPng(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica' },
  });
  return resvg.render().asPng();
}

function buildMetaBlock(tool: Tool, ogImageUrl: string, canonicalUrl: string): string {
  const title = escapeHtml(tool.title);
  const description = escapeHtml(tool.description);
  const url = escapeHtml(canonicalUrl);
  const image = escapeHtml(ogImageUrl);
  return [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" content="#0f172a" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Little Tools" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
    .map((l) => `    ${l}`)
    .join('\n');
}

function applyTemplate(
  template: string,
  tool: Tool,
  ogImageUrl: string,
  canonicalUrl: string
): string {
  const titleTag = `<title>${escapeHtml(tool.title)}</title>`;
  const out = template.replace(/<title>[^<]*<\/title>/, titleTag);

  const startIdx = out.indexOf(SEO_BLOCK_START);
  const endIdx = out.indexOf(SEO_BLOCK_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `vite-plugin-seo: index.html is missing ${SEO_BLOCK_START} / ${SEO_BLOCK_END} markers`
    );
  }
  const block = buildMetaBlock(tool, ogImageUrl, canonicalUrl);
  return out.slice(0, startIdx) + SEO_BLOCK_START + '\n' + block + '\n    ' + out.slice(endIdx);
}

export function seoPlugin(): Plugin {
  let isSsrBuild = false;
  return {
    name: 'little-tools:seo',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build?.ssr);
    },
    async closeBundle() {
      if (isSsrBuild) return;
      const distDir = join(process.cwd(), 'dist');
      const indexPath = join(distDir, 'index.html');
      const template = await readFile(indexPath, 'utf8');

      for (const tool of TOOLS) {
        const slug = tool.slug || 'index';
        const ogPath = join(distDir, 'og', `${slug}.png`);
        const ogUrl = `${SITE_URL}/og/${slug}.png`;
        const canonicalUrl = tool.slug ? `${SITE_URL}/${tool.slug}` : `${SITE_URL}/`;

        const svg = buildOgSvg(tool);
        const png = renderPng(svg);
        await mkdir(dirname(ogPath), { recursive: true });
        await writeFile(ogPath, png);

        const html = applyTemplate(template, tool, ogUrl, canonicalUrl);
        const htmlPath = tool.slug ? join(distDir, tool.slug, 'index.html') : indexPath;
        await mkdir(dirname(htmlPath), { recursive: true });
        await writeFile(htmlPath, html);
      }
    },
  };
}
