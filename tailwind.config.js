/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe8ff',
          200: '#b7d1ff',
          300: '#8bb4ff',
          400: '#5a8dff',
          500: '#2f6bff',
          600: '#1f52f5',
          700: '#1b43d8',
          800: '#1c3bb0',
          900: '#1b348c',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          800: '#1f2937',
          900: '#0b1220',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.10)',
        lift: '0 12px 40px rgba(15, 23, 42, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 420ms ease-out both',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'scale-in': 'scale-in 180ms ease-out both',
      },
    },
  },
  plugins: [],
};
