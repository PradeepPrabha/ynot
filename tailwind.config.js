/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F8F3EA',
        ivory: '#FFFDF8',
        beige: '#E9DDCC',
        brown: '#6B4226',
        cocoa: '#422817',
        ink: '#171512',
        gold: '#C39A61',
        coral: '#F0784B',
        success: '#258A48',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        script: ['"Mrs Saint Delafield"', '"Brush Script MT"', 'cursive'],
      },
      boxShadow: {
        soft: '0 6px 24px -10px rgba(66, 40, 23, 0.18)',
        lift: '0 14px 34px -14px rgba(66, 40, 23, 0.28)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        'drawer-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'drawer-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': { from: { opacity: '0', transform: 'translateY(8px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
        'check-draw': { to: { strokeDashoffset: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        shimmer: { to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'drawer-in': 'drawer-in .28s ease-out',
        'drawer-in-left': 'drawer-in-left .28s ease-out',
        'fade-in': 'fade-in .2s ease-out',
        'pop-in': 'pop-in .22s ease-out',
        'check-draw': 'check-draw .6s .15s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
