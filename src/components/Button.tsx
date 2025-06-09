import { css } from '@styled-system/css';
import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'sm',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${css({
        px: size === 'sm' ? '3' : '4',
        py: size === 'sm' ? '1' : '2',
        borderRadius: 'md',
        border: '1px solid',
        cursor: 'pointer',
        fontSize: size === 'sm' ? 'sm' : 'base',
        _hover: {
          backgroundColor: variant === 'primary' ? 'gray.600' : 'gray.100',
        },
        _disabled: {
          cursor: 'not-allowed',
          opacity: 0.5,
        },
      })} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
