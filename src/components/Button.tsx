import { css } from '@styled-system/css';
import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'sm',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = {
    px: size === 'sm' ? '3' : '4',
    py: size === 'sm' ? '1.5' : '2.5',
    borderRadius: 'md',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: size === 'sm' ? 'sm' : 'base',
    fontWeight: 'medium',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition:
      'background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.08s ease, box-shadow 0.18s ease',
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    _active: {
      transform: 'scale(0.96)',
      transitionDuration: '0.05s',
    },
    _focusVisible: {
      outline: 'none',
      boxShadow: '0 0 0 2px var(--colors-accent)',
    },
  } as const;

  const variantStyles =
    variant === 'primary'
      ? {
          backgroundColor: 'accent',
          color: 'fg.onAccent',
          borderColor: 'accent',
          _hover: { backgroundColor: 'accent.hover', borderColor: 'accent.hover' },
        }
      : variant === 'secondary'
        ? {
            backgroundColor: 'bg.panel',
            color: 'fg',
            borderColor: 'border',
            _hover: { backgroundColor: 'bg.subtle', borderColor: 'border.strong' },
          }
        : {
            backgroundColor: 'transparent',
            color: 'fg.muted',
            borderColor: 'transparent',
            _hover: { backgroundColor: 'bg.subtle', color: 'fg' },
          };

  return (
    <button className={`${css({ ...baseStyles, ...variantStyles })} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
