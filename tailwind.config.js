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
        pump: {
          green: '#00FF88', // Bright mint green from pump.fun
          dark: '#000000',
          darker: '#000000',
          bg: '#000000',
          card: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
}

