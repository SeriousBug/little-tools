import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import './index.css';
import { hydrateThemeFromStorage } from './theme';
import { hydrateSidebarFromStorage } from './sidebar';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// After hydration, swap defaults for the user's stored preferences.
hydrateThemeFromStorage();
hydrateSidebarFromStorage();
