import { create } from 'zustand';
import { useCallback } from 'react';
import { RadioGroup } from '@ark-ui/react/radio-group';
import { css } from '@styled-system/css';
import { Buffer } from 'buffer';

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    [setInputText]
  );

  const handleModeChange = useCallback(
    (details: { value: string | null }) => {
      if (details.value === 'encode' || details.value === 'decode') {
        setMode(details.value);
      }
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

      <RadioGroup.Root
        value={mode}
        onValueChange={handleModeChange}
        className={css({
          mb: '4',
          display: 'flex',
          flexDir: 'column',
          gap: '2',
        })}
      >
        <RadioGroup.Label className={css({ fontWeight: 'medium' })}>Mode:</RadioGroup.Label>
        <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
          <RadioGroup.Item
            value="encode"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              cursor: 'pointer',
            })}
          >
            <RadioGroup.ItemControl
              className={css({
                width: '4',
                height: '4',
                borderRadius: 'full',
                border: '2px solid',
                position: 'relative',
                _checked: {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '2',
                    height: '2',
                    borderRadius: 'full',
                    backgroundColor: 'blue.500',
                  },
                },
              })}
            />
            <RadioGroup.ItemText>Encode to Base64</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>

          <RadioGroup.Item
            value="decode"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              cursor: 'pointer',
            })}
          >
            <RadioGroup.ItemControl
              className={css({
                width: '4',
                height: '4',
                borderRadius: 'full',
                border: '2px solid',
                position: 'relative',
                _checked: {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '2',
                    height: '2',
                    borderRadius: 'full',
                    backgroundColor: 'blue.500',
                  },
                },
              })}
            />
            <RadioGroup.ItemText>Decode from Base64</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        </div>
      </RadioGroup.Root>

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
          <button
            onClick={handleClear}
            className={css({
              px: '3',
              py: '1',
              borderRadius: 'md',
              border: '1px solid',
              cursor: 'pointer',
              fontSize: 'sm',
              _hover: {
                backgroundColor: 'gray.600',
              },
            })}
          >
            Clear
          </button>
        </div>
        <textarea
          className={css({
            border: '1px solid',
            borderRadius: 'md',
            p: '3',
            width: '100%',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: mode === 'decode' ? 'mono' : 'inherit',
            _focus: {
              outline: 'none',
              boxShadow: '0 0 0 1px',
            },
          })}
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
            <button
              onClick={handleCopy}
              className={css({
                px: '3',
                py: '1',
                borderRadius: 'md',
                border: '1px solid',
                cursor: 'pointer',
                fontSize: 'sm',
                _hover: {
                  backgroundColor: 'gray.100',
                },
              })}
            >
              Copy
            </button>
          )}
        </div>
        <div
          className={css({
            p: '3',
            borderRadius: 'md',
            border: '1px solid',
            minHeight: '120px',
            fontFamily: mode === 'encode' ? 'mono' : 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            backgroundColor: 'gray.50',
            color: 'black',
          })}
        >
          {outputText || 'Output will appear here...'}
        </div>
      </div>
    </div>
  );
}
