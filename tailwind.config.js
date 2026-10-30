/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1d4ed8', // Royal Blue primary
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        navy: {
          700: '#1e3a8a',
          800: '#0f2547', // Deep Sapphire Blue
          900: '#08162b', // Midnight Ocean Blue
        },
        accent: {
          amber: '#f59e0b',
          gold: '#fbbf24',
          emerald: '#10b981',
          sky: '#0ea5e9',
        }
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
