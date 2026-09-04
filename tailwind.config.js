/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['11px', '16px'],
        'xs': ['12.5px', '17px'],
        'sm': ['13.5px', '19px'],
        'base': ['14.5px', '21px'],
        'lg': ['16px', '23px'],
        'xl': ['18px', '25px'],
        '2xl': ['22px', '28px'],
        '3xl': ['26px', '32px'],
      },
    },
  },
  plugins: [],
};
