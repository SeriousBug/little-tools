import { css } from '@styled-system/css';
import { createRootRoute, Link, LinkProps, Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactNode } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Icon, IconName } from '../components/Icon';
import { useSidebarStore } from '../sidebar';

const NAV_ITEMS: {
  to: NonNullable<LinkProps['to']>;
  label: string;
  icon: IconName;
  wiggle?: boolean;
}[] = [
  { to: '/', label: 'About', icon: 'hand', wiggle: true },
  { to: '/timestamp', label: 'Timestamp to Date', icon: 'clock' },
  { to: '/base64', label: 'Base64 Encoder/Decoder', icon: 'base64' },
  { to: '/epub', label: 'EPUB Chapter Renamer', icon: 'epub' },
];

function NavLink({
  to,
  icon,
  label,
  wiggle,
  collapsed,
}: {
  to: NonNullable<LinkProps['to']>;
  icon: IconName;
  label: string;
  wiggle?: boolean;
  collapsed: boolean;
}) {
  const location = useLocation();
  const isCurrent = location.pathname === to;

  return (
    <Link
      to={to}
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={css({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        paddingTop: '3',
        paddingBottom: '3',
        paddingLeft: '17px',
        paddingRight: '17px',
        color: isCurrent ? 'fg.onAccent' : 'fg.onSidebar',
        textDecoration: 'none',
        fontWeight: 'medium',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.18s ease, color 0.18s ease',
        backgroundColor: isCurrent ? 'bg.sidebarActive' : 'transparent',
        _before: isCurrent
          ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              backgroundColor: 'accent.secondary',
            }
          : {},
        _hover: {
          backgroundColor: isCurrent ? 'bg.sidebarActive' : 'bg.sidebarHover',
        },
        _active: {
          transform: 'scale(0.98)',
        },
        '& .nav-icon': {
          transition: 'transform 0.2s ease',
        },
        ...(wiggle
          ? {
              '@media (prefers-reduced-motion: no-preference)': {
                '&:hover .nav-icon, &:focus-visible .nav-icon': {
                  animation: 'wiggle 0.5s ease-in-out',
                  transformOrigin: '70% 80%',
                },
              },
            }
          : {}),
      })}
    >
      <Icon name={icon} className="nav-icon" />
      <span
        aria-hidden={collapsed ? true : undefined}
        className={css({
          userSelect: 'none',
          WebkitUserSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          transitionDelay: collapsed ? '0s' : '0.05s',
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
          pointerEvents: collapsed ? 'none' : 'auto',
        })}
      >
        {label}
      </span>
    </Link>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Little Tools — home"
      className={css({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '76px',
        paddingLeft: '17px',
        paddingRight: '17px',
        borderBottom: '1px solid',
        borderColor: 'whiteAlpha.200',
        color: 'fg.onSidebar',
        textDecoration: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.18s ease',
        _hover: { backgroundColor: 'bg.sidebarHover' },
        _active: { transform: 'scale(0.99)' },
      })}
    >
      <span
        aria-hidden={collapsed ? undefined : true}
        className={css({
          position: 'absolute',
          left: '17px',
          fontSize: 'lg',
          fontWeight: 'bold',
          letterSpacing: 'tight',
          transition: 'opacity 0.2s ease',
          opacity: collapsed ? 1 : 0,
        })}
      >
        LT
      </span>
      <span
        aria-hidden={collapsed ? true : undefined}
        className={css({
          display: 'flex',
          flexDirection: 'column',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          transitionDelay: collapsed ? '0s' : '0.05s',
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
          pointerEvents: collapsed ? 'none' : 'auto',
        })}
      >
        <span
          className={css({
            fontSize: 'lg',
            fontWeight: 'bold',
            letterSpacing: 'tight',
          })}
        >
          Little Tools
        </span>
        <span
          className={css({
            fontSize: 'xs',
            color: 'accent.secondary',
            mt: '1',
          })}
        >
          free · private · open source
        </span>
      </span>
    </Link>
  );
}

function CollapseButton({ collapsed }: { collapsed: boolean }) {
  const toggle = useSidebarStore((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: '3',
        my: '2',
        px: '2',
        py: '2',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'whiteAlpha.300',
        backgroundColor: 'transparent',
        color: 'fg.onSidebar',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background-color 0.18s ease, transform 0.1s ease',
        _hover: { backgroundColor: 'bg.sidebarHover' },
        _active: { transform: 'scale(0.95)' },
        _focusVisible: {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--colors-accent)',
        },
      })}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

function Footer() {
  return (
    <footer
      className={css({
        width: 'full',
        backgroundColor: 'bg.footer',
        color: 'fg.muted',
        borderTop: '1px solid',
        borderColor: 'border',
        px: '12',
        py: '6',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4',
        fontSize: 'sm',
      })}
    >
      <span className={css({ display: 'inline-flex', alignItems: 'center', gap: '1.5' })}>
        <span>Made with</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-label="love"
          role="img"
          className={css({ color: 'accent', display: 'inline-block' })}
        >
          <path d="M12 4.419c-2.826-5.695-11.999-4.064-11.999 3.27 0 7.27 9.903 10.938 11.999 15.311 2.096-4.373 12-8.041 12-15.311 0-7.327-9.17-8.972-12-3.27z" />
        </svg>
        <span>in Illinois</span>
      </span>
      <span aria-hidden="true" className={css({ color: 'border.strong' })}>
        ·
      </span>
      <a
        className={css({
          color: 'accent',
          textDecoration: 'none',
          fontWeight: 'medium',
          _hover: { textDecoration: 'underline', color: 'accent.hover' },
        })}
        href="https://github.com/SeriousBug/little-tools"
      >
        Open source · AGPLv3
      </a>
    </footer>
  );
}

function RootLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        minH: '100vh',
        backgroundColor: 'bg.canvas',
        color: 'fg',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          flex: '1',
        })}
      >
        <nav
          aria-label="Primary"
          className={css({
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'bg.sidebar',
            color: 'fg.onSidebar',
            justifyContent: 'space-between',
            width: collapsed ? '56px' : '256px',
            overflow: 'hidden',
            flexShrink: 0,
          })}
        >
          <div className={css({ display: 'flex', flexDirection: 'column' })}>
            <SidebarBrand collapsed={collapsed} />
            <div className={css({ display: 'flex', flexDirection: 'column', py: '2' })}>
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
          <div className={css({ display: 'flex', flexDirection: 'column' })}>
            <CollapseButton collapsed={collapsed} />
            <ThemeToggle collapsed={collapsed} />
          </div>
        </nav>
        <main
          className={css({
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            px: '6',
            py: '8',
          })}
        >
          <Outlet />
        </main>
      </div>
      <Footer />
      <TanStackRouterDevtools />
    </div>
  );
}

function RootWithGlobalStyles(): ReactNode {
  return (
    <>
      <style>{`
        @keyframes wiggle {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          35% { transform: rotate(10deg); }
          55% { transform: rotate(-8deg); }
          75% { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }
        button, a, [role="button"], summary, [data-no-select] {
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
      <RootLayout />
    </>
  );
}

export const Route = createRootRoute({
  component: RootWithGlobalStyles,
});
