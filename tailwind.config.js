/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        iosblue: {
          DEFAULT: '#007AFF',
          light: '#E5F0FF',
        },
        iosgray: {
          light: '#F7F7F7',
          DEFAULT: '#E5E5EA',
          dark: '#C7C7CC',
        },
      },
      borderRadius: {
        ios: '20px',
      },
      boxShadow: {
        ios: '0 2px 8px 0 rgba(60,60,67,0.08)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}; 