import { css } from '@styled-system/css';
import { useThemeStore, type ThemePreference } from '../theme';

const ICONS: Record<ThemePreference, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

const NEXT_LABEL: Record<ThemePreference, string> = {
  system: 'Switch to light mode',
  light: 'Switch to dark mode',
  dark: 'Switch to system preference',
};

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const preference = useThemeStore((s) => s.preference);
  const cycle = useThemeStore((s) => s.cycle);

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={NEXT_LABEL[preference]}
      title={
        collapsed ? `${ICONS[preference]} — ${NEXT_LABEL[preference]}` : NEXT_LABEL[preference]
      }
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2',
        mx: '3',
        mt: '1',
        mb: '3',
        px: collapsed ? '2' : '3',
        py: '2',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'whiteAlpha.300',
        backgroundColor: 'transparent',
        color: 'fg.onSidebar',
        cursor: 'pointer',
        fontSize: 'sm',
        fontWeight: 'medium',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background-color 0.2s, border-color 0.2s, transform 0.1s ease',
        _hover: {
          backgroundColor: 'bg.sidebarHover',
          borderColor: 'accent.secondary',
        },
        _active: {
          transform: 'scale(0.96)',
        },
        _focusVisible: {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--colors-accent)',
        },
      })}
    >
      <ThemeIcon preference={preference} />
      {!collapsed && <span>{ICONS[preference]}</span>}
    </button>
  );
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  const iconStyle = css({ width: '16px', height: '16px', display: 'block' });

  if (preference === 'light') {
    return (
      <svg
        className={iconStyle}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (preference === 'dark') {
    return (
      <svg
        className={iconStyle}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }

  return (
    <svg
      className={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 20h8M12 18v2" />
    </svg>
  );
}
