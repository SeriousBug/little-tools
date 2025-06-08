import { css } from '@styled-system/css';
import { createRootRoute, Link, LinkProps, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function NavLink({ to, children }: LinkProps) {
  return (
    <Link to={to} className={css({ padding: '2' })}>
      {children}
    </Link>
  );
}

function NavSeparator() {
  return <div className={css({ padding: '1px', backgroundColor: 'white' })}></div>;
}

function Footer() {
  return (
    <footer
      className={css({
        width: 'full',
        backgroundColor: 'blackAlpha.200',
        px: '12',
        py: '8',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      })}
    >
      <h2 className={css({ display: 'flex', flexDirection: 'row' })}>
        Made with{' '}
        <span
          className={css({
            display: 'inline-block',
            width: '24px',
            height: '24px',
            transform: 'scale(0.5)',
            backgroundColor: 'red.500',
            clipPath:
              "path('M12 4.419c-2.826-5.695-11.999-4.064-11.999 3.27 0 7.27 9.903 10.938 11.999 15.311 2.096-4.373 12-8.041 12-15.311 0-7.327-9.17-8.972-12-3.27z')",
          })}
          aria-label="love"
        ></span>{' '}
        in Illinois
      </h2>
      <div
        className={css({
          mx: '4',
          width: '4px',
          height: '4px',
          borderRadius: 'full',
        })}
      ></div>
      <a
        className={css({
          textDecoration: 'underline',
        })}
        href="https://github.com/SeriousBug/little-tools"
      >
        This is open source software, licensed under AGPLv3.
      </a>
    </footer>
  );
}

export const Route = createRootRoute({
  component: () => (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column', // Changed to column to include footer at bottom
        minH: '100vh',
        alignContent: 'stretch',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          flex: '1',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'gray.900',
            justifyContent: 'start',
            width: '64',
          })}
        >
          <NavLink to="/">About</NavLink>
          <NavSeparator />
          <NavLink to="/timestamp">Timestamp to Date</NavLink>
          <NavSeparator />
          <NavLink to="/base64">Base64 Encoder/Decoder</NavLink>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <Outlet />
        </div>
      </div>
      <Footer />
      <TanStackRouterDevtools />
    </div>
  ),
});
