import { create } from 'zustand';
import { useCallback, useMemo, useState } from 'react';
import { css } from '@styled-system/css';
import { RadioGroup } from '../components/RadioGroup';
import { TextInput } from '../components/TextInput';
import { TextDisplay } from '../components/TextDisplay';

interface State {
  dateTime: Date;
  /** Whether the user pick an override for the timestamp format or not.
   *
   * By default we guess the format based on the timestamp value.
   * If the value is too large, it's probably in milliseconds.
   */
  timestampFormat: 'milliseconds' | 'seconds' | undefined;
  // Actions
  setTimestampFormat: (format: 'milliseconds' | 'seconds' | undefined) => void;
  parseTimestampInput: (input: string) => Date | undefined;
}

const MS_TIMESTAMP_LENGTH = 13;

const useTimestampStore = create<State>((set, get) => ({
  dateTime: new Date(),
  timestampFormat: undefined,
  setTimestampFormat: (timestampFormat) => set({ timestampFormat }),
  parseTimestampInput: (input: string) => {
    input = input.trim();

    const value = Number.parseInt(input, 10);
    if (Number.isNaN(value)) {
      return undefined;
    }

    const { timestampFormat } = get();

    if (timestampFormat === 'milliseconds') {
      const newDate = new Date(value);
      set({ dateTime: newDate });
      return newDate;
    }

    if (timestampFormat === 'seconds') {
      const newDate = new Date(value * 1000);
      set({ dateTime: newDate });
      return newDate;
    }

    // Infer format but don't set it
    if (input.length >= MS_TIMESTAMP_LENGTH) {
      const newDate = new Date(value);
      set({ dateTime: newDate });
      return newDate;
    }

    const newDate = new Date(value * 1000);
    set({ dateTime: newDate });
    return newDate;
  },
}));

function useFormattedTimestamp() {
  const timestampFormat = useTimestampStore((state) => state.timestampFormat);
  const dateTime = useTimestampStore((state) => state.dateTime);

  return useMemo(() => {
    // If explicit format is set, use it
    if (timestampFormat === 'milliseconds') {
      return dateTime.getTime();
    }
    if (timestampFormat === 'seconds') {
      return Math.floor(dateTime.getTime() / 1000);
    }

    // Otherwise infer format based on timestamp size
    const timestamp = dateTime.getTime();
    const timestampString = timestamp.toString();
    if (timestampString.length >= MS_TIMESTAMP_LENGTH) {
      return timestamp;
    } else {
      return Math.floor(timestamp / 1000);
    }
  }, [dateTime, timestampFormat]);
}

function useFormattedDate() {
  const dateTime = useTimestampStore((state) => state.dateTime);

  return useMemo(() => {
    return dateTime.toLocaleString();
  }, [dateTime]);
}

export function TimestampPage() {
  // useState for the input value
  const [dateInput, setDateInput] = useState('');

  // Use the hooks
  const parseTimestampInput = useTimestampStore((state) => state.parseTimestampInput);
  const timestampFormat = useTimestampStore((state) => state.timestampFormat);
  const setTimestampFormat = useTimestampStore((state) => state.setTimestampFormat);
  const formattedTimestamp = useFormattedTimestamp();
  const formattedDate = useFormattedDate();

  const formatOptions = [
    { value: 'auto' as const, label: 'Auto-detect' },
    { value: 'milliseconds' as const, label: 'Milliseconds (JS)' },
    { value: 'seconds' as const, label: 'Seconds (UNIX)' },
  ];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDateInput(e.target.value);
    },
    []
  );

  const handleBlur = useCallback(() => {
    parseTimestampInput(dateInput);
  }, [dateInput, parseTimestampInput]);

  const handleFormatChange = useCallback(
    (value: 'auto' | 'milliseconds' | 'seconds') => {
      if (value === 'auto') {
        setTimestampFormat(undefined);
      } else {
        setTimestampFormat(value as 'milliseconds' | 'seconds');
      }
      // Re-parse the current input with the new format if it's not empty
      if (dateInput) {
        parseTimestampInput(dateInput);
      }
    },
    [setTimestampFormat, dateInput, parseTimestampInput]
  );

  return (
    <div
      className={css({
        maxW: '600px',
        mx: 'auto',
        p: '6',
        borderRadius: 'md',
        boxShadow: 'sm',
        display: 'flex',
        flexDir: 'column',
        gap: '4',
      })}
    >
      <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>
        Timestamp and Date Converter
      </h2>
      <p className={css({ mb: '4' })}>
        Convert timestamps to dates. Both millisecond timestamps (like JavaScript) and second
        timestamps (UNIX) are supported.
      </p>

      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          gap: '2',
          mb: '4',
        })}
      >
        <label className={css({ fontWeight: 'medium', mb: '1' })}>Timestamp:</label>
        <TextInput
          fontFamily="mono"
          onChange={handleChange}
          onBlur={handleBlur}
          value={dateInput}
          placeholder="Enter a timestamp value"
        />

        {dateInput && (
          <div className={css({ mt: '1', fontSize: 'sm', color: 'gray.600' })}>
            Detected format:{' '}
            {timestampFormat ||
              (dateInput.length >= MS_TIMESTAMP_LENGTH ? 'milliseconds' : 'seconds')}
          </div>
        )}

        <RadioGroup
          options={formatOptions}
          value={timestampFormat || 'auto'}
          onValueChange={handleFormatChange}
          label="Format:"
          className={css({ mt: '3' })}
        />
      </div>

      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          gap: '2',
          p: '3',
          borderRadius: 'md',
          mb: '3',
          border: '1px solid',
        })}
      >
        <label className={css({ fontWeight: 'medium' })}>Date:</label>
        <TextDisplay
          fontFamily="mono"
          minHeight="auto"
          backgroundColor="transparent"
          color="inherit"
          className={css({ p: '2', border: '1px solid' })}
        >
          {formattedDate}
        </TextDisplay>
      </div>

      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          gap: '2',
          p: '3',
          borderRadius: 'md',
          border: '1px solid',
        })}
      >
        <label className={css({ fontWeight: 'medium' })}>Formatted Timestamp:</label>
        <TextDisplay
          fontFamily="mono"
          minHeight="auto"
          backgroundColor="transparent"
          color="inherit"
          className={css({ p: '2', border: '1px solid' })}
        >
          {formattedTimestamp}
        </TextDisplay>
      </div>
    </div>
  );
}
