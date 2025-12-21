/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // We are removing custom colors here to avoid configuration errors.
      // We will use standard Tailwind classes (indigo-900, white/10, etc.)
    },
  },
  plugins: [],
}