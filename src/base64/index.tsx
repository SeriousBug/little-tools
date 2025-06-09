import { create } from 'zustand';
import { useCallback } from 'react';
import { css } from '@styled-system/css';
import { Buffer } from 'buffer';
import { RadioGroup } from '../components/RadioGroup';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { TextDisplay } from '../components/TextDisplay';

interface State {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  // Actions
  setMode: (mode: 'encode' | 'decode') => void;
  setInputText: (text: string) => void;
  processText: (input: string, mode: 'encode' | 'decode') => void;
}

const useBase64Store = create<State>((set, get) => ({
  inputText: '',
  outputText: '',
  mode: 'encode',
  setMode: (mode) => {
    set({ mode });
    // Re-process current input with new mode
    const { inputText } = get();
    if (inputText) {
      get().processText(inputText, mode);
    }
  },
  setInputText: (inputText) => {
    set({ inputText });
    // Process the text immediately
    get().processText(inputText, get().mode);
  },
  processText: (input: string, mode: 'encode' | 'decode') => {
    if (!input.trim()) {
      set({ outputText: '' });
      return;
    }

    try {
      if (mode === 'encode') {
        set({
          outputText: Buffer.from(input, 'utf-8').toString('base64'),
        });
      } else {
        set({
          outputText: Buffer.from(input, 'base64').toString('utf-8'),
        });
      }
    } catch (error) {
      set({
        outputText:
          'Error: Invalid input for ' +
          mode +
          '\n\n' +
          (typeof error === 'object' && error && 'message' in error
            ? error.message
            : String(error)),
      });
    }
  },
}));

export function Base64Page() {
  const { inputText, outputText, mode, setMode, setInputText } = useBase64Store();

  const modeOptions = [
    { value: 'encode' as const, label: 'Encode to Base64' },
    { value: 'decode' as const, label: 'Decode from Base64' },
  ];

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setInputText(e.target.value);
    },
    [setInputText]
  );

  const handleModeChange = useCallback(
    (value: 'encode' | 'decode') => {
      setMode(value);
    },
    [setMode]
  );

  const handleClear = useCallback(() => {
    setInputText('');
  }, [setInputText]);

  const handleCopy = useCallback(async () => {
    if (outputText && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(outputText);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  }, [outputText]);

  return (
    <div
      className={css({
        maxW: '800px',
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
        Base64 Encoder/Decoder
      </h2>
      <p className={css({ mb: '4' })}>
        Encode text to Base64 or decode Base64 back to text. Select the mode and enter your text
        below.
      </p>

      <RadioGroup
        options={modeOptions}
        value={mode}
        onValueChange={handleModeChange}
        label="Mode:"
        className={css({ mb: '4' })}
      />

      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          gap: '2',
          mb: '4',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <label className={css({ fontWeight: 'medium' })}>
            Input ({mode === 'encode' ? 'Plain Text' : 'Base64'}):
          </label>
          <Button onClick={handleClear}>Clear</Button>
        </div>
        <TextInput
          multiline
          fontFamily={mode === 'decode' ? 'mono' : 'inherit'}
          onChange={handleInputChange}
          value={inputText}
          placeholder={
            mode === 'encode'
              ? 'Enter the text you want to encode to Base64...'
              : 'Enter the Base64 text you want to decode...'
          }
        />
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
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <label className={css({ fontWeight: 'medium' })}>
            Output ({mode === 'encode' ? 'Base64' : 'Plain Text'}):
          </label>
          {outputText && !outputText.startsWith('TODO:') && !outputText.startsWith('Error:') && (
            <Button variant="secondary" onClick={handleCopy}>
              Copy
            </Button>
          )}
        </div>
        <TextDisplay fontFamily={mode === 'encode' ? 'mono' : 'inherit'}>{outputText}</TextDisplay>
      </div>
    </div>
  );
}
