import { StrictMode } from 'react';
import { hydrateRoot, type HydrationOptions } from 'react-dom/client';
import './index.css';
import { hydrateThemeFromStorage } from './theme';
import { hydrateSidebarFromStorage } from './sidebar';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });
// Tell TanStack Router we're hydrating SSR'd markup, so its <Matches>
// doesn't wrap children in <Suspense> on the client. Without this, server
// renders a plain fragment and client wraps in Suspense — that mismatch
// is what makes React throw out the whole hydrated tree.
(router as unknown as { clientSsr: { getStreamedValue: () => undefined } }).clientSsr = {
  getStreamedValue: () => undefined,
};

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Exported so tests can drive the exact same hydration sequence as the
// production entry. Any change here is also exercised by the SSR hydration
// test in hydration.test.tsx.
export async function hydrateApp(container: HTMLElement, options?: HydrationOptions) {
  // Load lazy route chunks before hydrating; otherwise React mounts a
  // Suspense fallback while the server rendered actual route content. With
  // autoCodeSplitting enabled this is required in production — happy-dom
  // tests don't notice because routeTree.gen imports load eagerly in Node.
  await router.load();
  return hydrateRoot(
    container,
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
    options
  );
}

const rootEl = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (rootEl) {
  hydrateApp(rootEl).then(() => {
    hydrateThemeFromStorage();
    hydrateSidebarFromStorage();
  });
}
