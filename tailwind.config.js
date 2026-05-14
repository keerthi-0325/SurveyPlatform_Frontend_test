/** @type {import('tailwindcss').Config} */
export default {
  // Scan all source files including the landing folder
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', hover: '#4f46e5' },
      },
    },
  },
  plugins: [],
};
