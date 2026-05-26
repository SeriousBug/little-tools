import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import './theme';
import { routeTree } from './routeTree.gen';

export { TOOLS } from './tools';

export async function render(url: string): Promise<string> {
  const router = createRouter({
    routeTree,
    // Force the server-side branch in tanstack-router. Defaults to
    // `typeof document === 'undefined'`, which is false under happy-dom in
    // tests — without this, render() would take the client code path and
    // produce different HTML.
    isServer: true,
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  return renderToString(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
