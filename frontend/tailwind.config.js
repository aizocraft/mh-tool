// tailwind.config.js
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
        primary: '#22c55e',
      },
    },
  },
  plugins: [],
}