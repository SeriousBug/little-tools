import { createFileRoute } from '@tanstack/react-router';
import { css } from '@styled-system/css';

export const Route = createFileRoute('/')({ component: RouteComponent });

function RouteComponent() {
  return (
    <div
      className={css({
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem',
        lineHeight: '1.6',
        backgroundColor: 'bg.panel',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'border',
        color: 'fg',
      })}
    >
      <h1
        className={css({
          fontSize: '3xl',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: 'fg',
        })}
      >
        Little Tools
      </h1>

      <p className={css({ marginBottom: '1rem' })}>
        Welcome to Little Tools - a collection of simple, free, and safe utilities for everyday
        digital tasks.
      </p>

      <h2
        className={css({
          fontSize: 'xl',
          fontWeight: 'semibold',
          marginTop: '2rem',
          marginBottom: '1rem',
          color: 'accent',
        })}
      >
        Why Little Tools?
      </h2>

      <p className={css({ marginBottom: '1rem' })}>
        Many online tools are cluttered with ads, trackers, and sometimes even malware. I created
        Little Tools as a safe alternative - no ads, no tracking, and completely open source.
      </p>

      <p className={css({ marginBottom: '1rem' })}>I believe essential digital tools should be:</p>

      <ul
        className={css({
          listStyleType: 'none',
          paddingLeft: '0',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '3',
        })}
      >
        {(
          [
            ['Free', 'No hidden costs, no premium features'],
            ['Private', 'Your data stays on your device'],
            ['Fast', 'Lightweight and quick to use'],
            ['Safe', 'No malware, no ads'],
          ] as const
        ).map(([title, body]) => (
          <li
            key={title}
            className={css({
              p: '3',
              borderRadius: 'md',
              backgroundColor: 'bg.subtle',
              borderLeft: '3px solid',
              borderColor: 'accent.secondary',
            })}
          >
            <strong className={css({ color: 'accent' })}>{title}</strong>
            <div className={css({ fontSize: 'sm', color: 'fg.muted', mt: '1' })}>{body}</div>
          </li>
        ))}
      </ul>

      <h2
        className={css({
          fontSize: 'xl',
          fontWeight: 'semibold',
          marginTop: '2rem',
          marginBottom: '1rem',
          color: 'accent',
        })}
      >
        Open Source
      </h2>

      <p className={css({ marginBottom: '1rem' })}>
        Little Tools is proudly open source. You can view the code, contribute, or report issues on
        my GitHub repository. This is my personal passion project - not a corporate initiative -
        built with care and attention to detail.
      </p>

      <p className={css({ marginBottom: '1rem' })}>
        Use these tools with confidence, knowing they&apos;re built with simplicity and security in
        mind by someone who cares about creating safer alternatives online.
      </p>
    </div>
  );
}
