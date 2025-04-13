import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.git', 'styled-system'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      prettierConfig,
    ],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react: reactPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-react': 'off', // Not needed in React 17+
    },
    settings: { react: { version: 'detect' } },
  }
);
