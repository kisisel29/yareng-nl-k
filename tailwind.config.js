/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#F7F5F0',
          100: '#EFECE4',
          200: '#E2DDD3',
          300: '#CFC8BA',
          400: '#B3AB9C',
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
        serif: ['Calibri', 'Carlito', 'Segoe UI', 'sans-serif'],
        sans: ['Calibri', 'Carlito', 'Segoe UI', 'sans-serif'],
        calibri: ['Calibri', 'Carlito', 'Segoe UI', 'sans-serif'],
        column: ['"Cormorant Garamond"', 'Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        card: 'none',
        'book-rest': '6px 10px 22px rgba(17, 17, 16, 0.22)',
        book: '10px 18px 32px rgba(17, 17, 16, 0.32)',
      },
    },
  },
  plugins: [],
};
