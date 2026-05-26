import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const ssrEntry = join(projectRoot, 'dist-ssr', 'entry-server.js');

const { render, TOOLS } = await import(pathToFileURL(ssrEntry).href);

const ROOT_MARKER = '<div id="root"></div>';

for (const tool of TOOLS) {
  const htmlPath = tool.slug ? join(distDir, tool.slug, 'index.html') : join(distDir, 'index.html');
  const url = tool.slug ? `/${tool.slug}` : '/';

  const template = await readFile(htmlPath, 'utf8');
  if (!template.includes(ROOT_MARKER)) {
    throw new Error(`prerender: ${htmlPath} is missing ${ROOT_MARKER}`);
  }

  const appHtml = await render(url);
  const out = template.replace(ROOT_MARKER, `<div id="root">${appHtml}</div>`);
  await writeFile(htmlPath, out);
  console.log(`prerendered ${url} → ${htmlPath}`);
}
