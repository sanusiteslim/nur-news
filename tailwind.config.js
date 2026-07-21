/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#4CAF50',
          700: '#2E7D32',
          800: '#1B5E20',
          900: '#0D3B0E',
        },
        accent: {
          red: '#C62828',
          orange: '#F57C00',
        },
        surface: {
          white: '#FFFFFF',
          offwhite: '#F5F5F5',
          card: '#FAFAFA',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#616161',
          muted: '#9E9E9E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}