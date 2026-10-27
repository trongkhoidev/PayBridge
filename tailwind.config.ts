import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      colors: {
        // Vercel / Geist monochrome palette
        vercel: {
          bg: '#FFFFFF',
          accents1: '#FAFAFA',
          accents2: '#EAEAEA',
          accents3: '#999999',
          accents4: '#888888',
          accents5: '#666666',
          accents6: '#444444',
          accents7: '#333333',
          accents8: '#111111',
          black: '#000000',
          blue: '#0070F3',
          cyan: '#50E3C2',
          purple: '#7928CA',
          magenta: '#EB367F',
          warning: '#F5A623',
          success: '#0070F3',
          error: '#EE0000',
        },
      },
      boxShadow: {
        'vercel-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'vercel': '0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'vercel-lg': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
