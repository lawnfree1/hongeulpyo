/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
        '2xl': '1536px',
      },
      fontFamily: {
        'score-dream': ['SCoreDream', 'system-ui', '-apple-system', 'sans-serif'],
        'pretendard': ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#e14140',
        secondary: '#fc0',
        dark: '#333',
        light: '#ebebeb',
      },
    },
  },
  plugins: [],
}
