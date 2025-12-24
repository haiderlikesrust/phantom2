/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        phantom: {
          purple: '#AB9FF2',
          dark: '#0D0D0D',
          darker: '#000000',
          bg: '#0D0D0D',
          card: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}

