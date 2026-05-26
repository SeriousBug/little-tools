import { describe, it, expect, afterEach } from 'vitest';
import { hydrateApp } from './main';
import { render as renderServer } from './entry-server';

async function hydrateAtPath(path: string): Promise<unknown[]> {
  const serverHtml = await renderServer(path);

  const container = document.createElement('div');
  container.id = 'root';
  container.innerHTML = serverHtml;
  document.body.appendChild(container);

  window.history.replaceState({}, '', path);

  const errors: unknown[] = [];
  const root = await hydrateApp(container, {
    onRecoverableError: (err) => errors.push(err),
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  root.unmount();
  container.remove();
  return errors;
}

describe('SSR hydration', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
  });

  for (const path of ['/', '/base64/', '/timestamp/', '/epub/']) {
    it(`hydrates ${path} without mismatch`, async () => {
      const errors = await hydrateAtPath(path);
      expect(errors).toEqual([]);
    });
  }
});
