import { createFileRoute } from '@tanstack/react-router';
import { css } from '@styled-system/css';

export const Route = createFileRoute('/')({ component: RouteComponent });

function RouteComponent() {
  return (
    <div
      className={css({ maxWidth: '800px', margin: '0 auto', padding: '2rem', lineHeight: '1.6' })}
    >
      <h1 className={css({ fontSize: '3xl', fontWeight: 'bold', marginBottom: '1.5rem' })}>
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
        })}
      >
        Why Little Tools?
      </h2>

      <p className={css({ marginBottom: '1rem' })}>
        Many online tools are cluttered with ads, trackers, and sometimes even malware. I created
        Little Tools as a safe alternative - no ads, no tracking, and completely open source.
      </p>

      <p className={css({ marginBottom: '1rem' })}>I believe essential digital tools should be:</p>

      <ul className={css({ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' })}>
        <li>
          <strong>Free</strong> - No hidden costs or premium features
        </li>
        <li>
          <strong>Private</strong> - Your data stays on your device
        </li>
        <li>
          <strong>Fast</strong> - Lightweight and quick to use
        </li>
        <li>
          <strong>Safe</strong> - No malware, no trackers
        </li>
      </ul>

      <h2
        className={css({
          fontSize: 'xl',
          fontWeight: 'semibold',
          marginTop: '2rem',
          marginBottom: '1rem',
        })}
      >
        Open Source
      </h2>

      <p className={css({ marginBottom: '1rem' })}>
        Little Tools is proudly open source. You can view the code, contribute, or report issues on
        my GitHub repository. This is my personal passion project - not a corporate initiative -
        built with care and attention to detail.
      </p>

      <p
        className={css({
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: 'md',
          fontStyle: 'italic',
        })}
      >
        Use these tools with confidence, knowing they&apos;re built with simplicity and security in
        mind by someone who cares about creating safer alternatives online.
      </p>
    </div>
  );
}
