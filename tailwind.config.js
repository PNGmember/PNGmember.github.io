/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'purple-night': {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9ddff',
          300: '#d7c1ff',
          400: '#be9aff',
          500: '#a16eff',
          600: '#8b47f7',
          700: '#7730e3',
          800: '#6426bf',
          900: '#52219c',
          950: '#341169',
        }
      }
    },
  },
  plugins: [],
}
