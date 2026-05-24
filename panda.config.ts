import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,

  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  exclude: [],

  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            ocean: { value: '#3c91e6' },
            oceanDark: { value: '#2f78c2' },
            oceanLight: { value: '#6caeec' },
            teal: { value: '#7fc6a4' },
            tealDark: { value: '#5fa886' },
            tealLight: { value: '#a3d8be' },
            slate: { value: '#2b4141' },
            slateDeep: { value: '#0e1818' },
            slateLight: { value: '#3d5757' },
            slateLighter: { value: '#56706f' },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            canvas: {
              value: { base: '#f4f8f5', _dark: '#000000' },
            },
            panel: {
              value: { base: '#ffffff', _dark: '#0f0f0f' },
            },
            subtle: {
              value: { base: '#e8efe9', _dark: '{colors.brand.slateDeep}' },
            },
            sidebar: {
              value: { base: '{colors.brand.slate}', _dark: '{colors.brand.slateDeep}' },
            },
            sidebarHover: {
              value: { base: '{colors.brand.slateLight}', _dark: '{colors.brand.slate}' },
            },
            sidebarActive: {
              value: { base: '{colors.brand.ocean}', _dark: '{colors.brand.oceanLight}' },
            },
            footer: {
              value: { base: '#e8efe9', _dark: '{colors.brand.slateDeep}' },
            },
          },
          fg: {
            DEFAULT: {
              value: { base: '{colors.brand.slate}', _dark: '#e8f0ee' },
            },
            muted: {
              value: { base: '{colors.brand.slateLighter}', _dark: '#8d9694' },
            },
            onAccent: {
              value: { base: '#ffffff', _dark: '#0b1620' },
            },
            onSidebar: {
              value: { base: '#e8f0ee', _dark: '#e8f0ee' },
            },
          },
          accent: {
            DEFAULT: {
              value: { base: '{colors.brand.ocean}', _dark: '{colors.brand.oceanLight}' },
            },
            hover: {
              value: { base: '{colors.brand.oceanDark}', _dark: '{colors.brand.ocean}' },
            },
            secondary: {
              value: { base: '{colors.brand.teal}', _dark: '{colors.brand.tealLight}' },
            },
          },
          border: {
            DEFAULT: {
              value: { base: '#cfdcd6', _dark: '{colors.brand.slateLight}' },
            },
            strong: {
              value: { base: '{colors.brand.slateLighter}', _dark: '{colors.brand.tealDark}' },
            },
            focus: {
              value: { base: '{colors.brand.ocean}', _dark: '{colors.brand.oceanLight}' },
            },
          },
        },
      },
    },
  },

  outdir: 'styled-system',
});
