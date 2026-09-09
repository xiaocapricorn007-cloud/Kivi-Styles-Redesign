/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Editorial New"', 'Editorial', 'Newsreader', 'serif'],
        serif: ['"Editorial New"', 'Editorial', 'Newsreader', 'serif'],
      },
      colors: {
        orange: {
          50: '#f5f0eb',
          100: '#eaddd0',
          200: '#dfcebf',
          300: '#d0bfae',
          400: '#a1887f',
          500: '#8d6e63',
          600: '#795548',
          700: '#5d4037',
          800: '#4e342e',
          900: '#3e2723',
        },
        amber: {
          50: '#f8f4f0',
          100: '#f0e6da',
          200: '#e5d3c1',
          300: '#d5bda6',
          400: '#bcaaa4',
          500: '#a1887f',
          600: '#8d6e63',
          700: '#795548',
          800: '#5d4037',
          900: '#4e342e',
        }
      }
    },
  },
  plugins: [],
}
