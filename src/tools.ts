import type { LinkProps } from '@tanstack/react-router';
import type { IconName } from './components/icon-names';

export interface Tool {
  to: NonNullable<LinkProps['to']>;
  slug: string;
  label: string;
  icon: IconName;
  wiggle?: boolean;
  title: string;
  description: string;
  ogHeadline: string;
  ogSubline: string;
}

export const SITE_URL = 'https://tools.bgenc.dev';
export const SITE_NAME = 'Little Tools';
export const SITE_DEFAULT_TITLE = 'Little Tools — Free, private, open-source utilities';
export const SITE_DESCRIPTION =
  'A collection of simple, free, and safe utilities for everyday digital tasks. No ads, no tracking, fully open source.';

export const TOOLS: Tool[] = [
  {
    to: '/',
    slug: '',
    label: 'About',
    icon: 'hand',
    wiggle: true,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    ogHeadline: 'Little Tools',
    ogSubline: 'Free, private, open-source utilities for everyday digital tasks',
  },
  {
    to: '/timestamp',
    slug: 'timestamp',
    label: 'Timestamp to Date',
    icon: 'clock',
    title: 'Unix Timestamp ↔ Date Converter · Little Tools',
    description:
      'Convert between Unix timestamps and human-readable dates, in seconds or milliseconds. Runs entirely in your browser — no data is uploaded.',
    ogHeadline: 'Timestamp ↔ Date',
    ogSubline: 'Convert Unix timestamps in your browser. Nothing leaves your device.',
  },
  {
    to: '/base64',
    slug: 'base64',
    label: 'Base64 Encoder/Decoder',
    icon: 'base64',
    title: 'Base64 Encoder & Decoder · Little Tools',
    description:
      'Encode text and files to Base64, or decode Base64 back. Works fully in your browser — no uploads, no tracking.',
    ogHeadline: 'Base64 Encoder & Decoder',
    ogSubline: 'Encode and decode Base64 locally in your browser.',
  },
  {
    to: '/epub',
    slug: 'epub',
    label: 'EPUB Chapter Renamer',
    icon: 'epub',
    title: 'EPUB Chapter Renamer · Little Tools',
    description:
      'Rename chapters inside EPUB ebooks right in your browser. Your files stay on your device — nothing is uploaded.',
    ogHeadline: 'EPUB Chapter Renamer',
    ogSubline: 'Rename ebook chapters locally. Your files never leave your device.',
  },
  {
    to: '/metadata',
    slug: 'metadata',
    label: 'Metadata Scrubber',
    icon: 'eye',
    title: 'Metadata Scrubber · Little Tools',
    description:
      'See what personal data your photos leak — GPS coordinates, camera model, timestamps. View and strip EXIF/metadata client-side, no upload.',
    ogHeadline: 'Metadata Scrubber',
    ogSubline: 'View & remove EXIF / metadata from images. 100% client-side, no upload.',
  },
];

export function findToolByPathname(pathname: string): Tool | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return TOOLS.find((t) => t.to === normalized);
}
