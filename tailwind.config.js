/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFFFF',
          100: '#F6F6F3',
          200: '#EBEBE6',
          300: '#D8D8D1',
          400: '#B5B5AC',
        },
        ink: {
          500: '#6F6F6A',
          600: '#4A4A46',
          700: '#2E2E2B',
          800: '#1A1A18',
          900: '#111110',
        },
        burgundy: {
          600: '#245A8E',
          700: '#163A5F',
          800: '#0F2744',
        },
        silver: {
          100: '#F3F3F1',
          300: '#D8D8D1',
          500: '#8A8A84',
          700: '#5C5C56',
        },
        copper: {
          500: '#163A5F',
          700: '#163A5F',
          800: '#0F2744',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'none',
      },
    },
  },
  plugins: [],
};
