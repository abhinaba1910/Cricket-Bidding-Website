/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
      bounceFast: "bounce 0.75s infinite",
      pulseFast:  "pulse  1s  infinite",
    },
      // import your CSS-variable RGB values so you can do e.g. bg-primary/50
      colors: {
        primary: {
          50: '#e9efff',
          100: '#c7d7ff',
          200: '#a4beff',
          300: '#7fa3ff',
          400: '#5a89ff',
          500: '#3a6ef0', // Primary base
          600: '#2d56c0',
          700: '#203f90',
          800: '#142860',
          900: '#081230',
        },
        secondary: {
          100: '#f1f5f9',
          500: '#1e293b',
          700: '#0f172a',
        },
        accent: {
          100: '#fff7ed',
          500: '#f59e0b',
          700: '#b45309',
        },
        success: {
          100: '#ecfdf5',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          100: '#fefce8',
          500: '#eab308',
          700: '#92400e',
        },
        error: {
          100: '#fef2f2',
          500: '#ef4444',
          700: '#991b1b',
        },
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

