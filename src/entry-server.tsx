import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import './theme';
import { routeTree } from './routeTree.gen';

export { TOOLS } from './tools';

export async function render(url: string): Promise<string> {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  return renderToString(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
