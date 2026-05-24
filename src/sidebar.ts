import { create } from 'zustand';

const STORAGE_KEY = 'little-tools:sidebar-collapsed';

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: readInitial(),
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
