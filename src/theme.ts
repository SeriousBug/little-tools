import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'little-tools:theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cycle: () => void;
}

// Initial state must match server render. Real values are loaded from
// localStorage after mount via hydrateThemeFromStorage().
export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  resolved: 'light',
  setPreference: (preference) => {
    if (typeof window !== 'undefined') {
      if (preference === 'system') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, preference);
      }
    }
    const resolved: ResolvedTheme = preference === 'system' ? getSystemTheme() : preference;
    applyTheme(resolved);
    set({ preference, resolved });
  },
  cycle: () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(get().preference) + 1) % order.length];
    get().setPreference(next);
  },
}));

export function hydrateThemeFromStorage(): void {
  if (typeof window === 'undefined') return;
  const preference = readStoredPreference();
  const resolved: ResolvedTheme = preference === 'system' ? getSystemTheme() : preference;
  applyTheme(resolved);
  useThemeStore.setState({ preference, resolved });
}

if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', (event) => {
    if (useThemeStore.getState().preference !== 'system') return;
    const resolved: ResolvedTheme = event.matches ? 'dark' : 'light';
    applyTheme(resolved);
    useThemeStore.setState({ resolved });
  });
}
