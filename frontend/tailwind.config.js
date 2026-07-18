/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        muted: '#F8FAFC',
        border: '#E2E8F0',
        atria: { DEFAULT: '#C41E3A', dark: '#9B1830', light: '#E8394F', pale: '#FDF2F4' },
        ok: { DEFAULT: '#16A34A', light: '#F0FDF4', dark: '#15803D' },
        no: { DEFAULT: '#DC2626', light: '#FEF2F2', dark: '#B91C1C' },
        warn: { DEFAULT: '#D97706', light: '#FFFBEB', dark: '#B45309' }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        card: '0 15px 35px rgba(15, 23, 42, 0.1)',
        elevated: '0 24px 60px rgba(15, 23, 42, 0.12)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}