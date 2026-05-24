import { css } from '@styled-system/css';
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseTextInputProps {
  multiline?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  fontFamily?: 'inherit' | 'mono';
}

type SingleLineProps = BaseTextInputProps & {
  multiline?: false;
} & Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseTextInputProps>;

type MultiLineProps = BaseTextInputProps & {
  multiline: true;
  minHeight?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseTextInputProps>;

export type TextInputProps = SingleLineProps | MultiLineProps;

export function TextInput({
  multiline = false,
  className,
  fontFamily = 'inherit',
  ...props
}: TextInputProps) {
  const baseStyles = css({
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 'md',
    p: multiline ? '3' : '2',
    width: '100%',
    fontFamily: fontFamily,
    backgroundColor: 'bg.panel',
    color: 'fg',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
    _placeholder: { color: 'fg.muted' },
    _hover: {
      borderColor: 'border.strong',
    },
    _focus: {
      outline: 'none',
      borderColor: 'border.focus',
      boxShadow: '0 0 0 3px rgba(60, 145, 230, 0.25)',
    },
  });

  if (multiline) {
    const { minHeight = '120px', resize = 'vertical', ...textareaProps } = props as MultiLineProps;
    return (
      <textarea
        className={`${baseStyles} ${css({
          minHeight,
          resize,
        })} ${className || ''}`}
        {...textareaProps}
      />
    );
  }

  return <input className={`${baseStyles} ${className || ''}`} {...(props as SingleLineProps)} />;
}
