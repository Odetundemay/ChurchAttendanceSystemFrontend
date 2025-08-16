/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f3',
          100: '#fdeee6',
          200: '#fbd9cc',
          300: '#f8bfa8',
          400: '#f49b7a',
          500: '#FB4F14',
          600: '#e23d0a',
          700: '#bc2f08',
          800: '#9a270c',
          900: '#7e240d',
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#06203A',
        }
      }
    },
  },
  plugins: [],
}