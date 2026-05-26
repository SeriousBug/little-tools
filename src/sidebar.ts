import { create } from 'zustand';

const STORAGE_KEY = 'little-tools:sidebar-collapsed';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

// Initial state must match server render. Stored value is loaded after mount
// via hydrateSidebarFromStorage().
export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: false,
  toggle: () => get().setCollapsed(!get().collapsed),
  setCollapsed: (value) => {
    if (typeof window !== 'undefined') {
      if (value) {
        window.localStorage.setItem(STORAGE_KEY, '1');
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    set({ collapsed: value });
  },
}));

export function hydrateSidebarFromStorage(): void {
  if (typeof window === 'undefined') return;
  const collapsed = window.localStorage.getItem(STORAGE_KEY) === '1';
  if (collapsed) useSidebarStore.setState({ collapsed: true });
}
