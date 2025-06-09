import { it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Base64Page } from './index';

afterEach(cleanup);

it('renders the base64 encoder/decoder', () => {
  render(<Base64Page />);
  // Use toBeTruthy instead of toBeInTheDocument
  expect(screen.getByText('Base64 Encoder/Decoder')).toBeTruthy();
  expect(
    screen.getByText(
      'Encode text to Base64 or decode Base64 back to text. Select the mode and enter your text below.'
    )
  ).toBeTruthy();
});

it('encodes text to base64 correctly', async () => {
  render(<Base64Page />);

  const plainText = 'Hello, World!';
  const expectedBase64 = 'SGVsbG8sIFdvcmxkIQ==';

  // Get the input field and type the text (encode mode is default)
  const input = screen.getByPlaceholderText('Enter the text you want to encode to Base64...');
  fireEvent.change(input, { target: { value: plainText } });

  // Check if the output is displayed correctly
  expect(screen.getByText(expectedBase64)).toBeTruthy();

  // Check that labels are correct for encode mode
  expect(screen.getByText('Input (Plain Text):')).toBeTruthy();
  expect(screen.getByText('Output (Base64):')).toBeTruthy();
});

it('decodes base64 to text correctly', async () => {
  render(<Base64Page />);

  const base64Text = 'SGVsbG8sIFdvcmxkIQ==';
  const expectedPlainText = 'Hello, World!';

  // Switch to decode mode
  const decodeRadio = screen.getByText('Decode from Base64')
    .previousElementSibling as HTMLInputElement;
  fireEvent.click(decodeRadio);

  // Get the input field and type the base64 text
  const input = await screen.findByPlaceholderText('Enter the Base64 text you want to decode...');
  fireEvent.change(input, { target: { value: base64Text } });

  // Check if the output is displayed correctly
  expect(screen.getByText(expectedPlainText)).toBeTruthy();
});
