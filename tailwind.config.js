/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF9F6',
          100: '#F4EFE6',
          200: '#E8DFD0',
          300: '#D4C5B0',
          400: '#B9A48A',
        },
        ink: {
          500: '#6B6560',
          600: '#4A4641',
          700: '#3D3A36',
          800: '#2C2A26',
          900: '#1C1B18',
        },
        burgundy: {
          600: '#8A4552',
          700: '#6B2D3C',
          800: '#4F222C',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 27, 24, 0.06)',
      },
    },
  },
  plugins: [],
};
