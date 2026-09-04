/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0d10',
        surface: '#111216',
        card: '#13151b',
      },
    },
  },
  plugins: [],
};
