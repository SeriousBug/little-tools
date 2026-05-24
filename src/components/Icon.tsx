import handIcon from '../assets/hand.svg?icon';
import clockIcon from '../assets/clock.svg?icon';
import base64Icon from '../assets/base64.svg?icon';
import epubIcon from '../assets/epub.svg?icon';
import { css } from '@styled-system/css';

export type IconName = 'hand' | 'clock' | 'base64' | 'epub';

const ICON_HTML: Record<IconName, string> = {
  hand: handIcon,
  clock: clockIcon,
  base64: base64Icon,
  epub: epubIcon,
};

interface IconProps {
  name: IconName;
  className?: string;
  size?: string;
  label?: string;
}

export function Icon({ name, className, size = '22px', label }: IconProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: ICON_HTML[name] }}
      className={`${css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        color: 'currentColor',
        '& svg': {
          width: '100%',
          height: '100%',
          display: 'block',
        },
      })} ${className || ''}`}
    />
  );
}
