import { css } from '@styled-system/css';
import { ReactNode } from 'react';

export interface TextDisplayProps {
  children: ReactNode;
  placeholder?: string;
  fontFamily?: 'inherit' | 'mono';
  minHeight?: string;
  backgroundColor?: string;
  color?: string;
  className?: string;
}

export function TextDisplay({
  children,
  placeholder = 'Output will appear here...',
  fontFamily = 'inherit',
  minHeight = '120px',
  backgroundColor = 'bg.subtle',
  color = 'fg',
  className,
}: TextDisplayProps) {
  return (
    <div
      className={`${css({
        p: '3',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'border',
        minHeight,
        fontFamily,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        backgroundColor,
        color,
      })} ${className || ''}`}
    >
      <div>{children || <span className={css({ color: 'fg.muted' })}>{placeholder}</span>}</div>
    </div>
  );
}
