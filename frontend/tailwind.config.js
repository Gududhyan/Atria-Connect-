/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        page: '#F4F6FA',
        border: '#E8ECF2',
        atria: { DEFAULT: '#C41E3A', dark: '#9B1830', light: '#E8394F', pale: '#FEF1F3' },
        ok: { DEFAULT: '#16A34A', light: '#F0FDF4', dark: '#15803D' },
        no: { DEFAULT: '#DC2626', light: '#FEF2F2', dark: '#B91C1C' },
        warn: { DEFAULT: '#D97706', light: '#FFFBEB', dark: '#B45309' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(15,23,42,0.05), 0 4px 16px rgba(15,23,42,0.04)',
        'card-hover': '0 2px 8px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.06)',
        elevated: '0 8px 30px rgba(15,23,42,0.12)',
        modal: '0 24px 60px rgba(15,23,42,0.2)',
      },
      borderRadius: {
        card: '16px',
        widget: '12px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['12px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['22px', '32px'],
        '3xl': ['28px', '36px'],
      }
    }
  },
  plugins: []
}