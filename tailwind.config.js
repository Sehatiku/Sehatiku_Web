/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#EEEFFE',
          100: '#D6D9FD',
          200: '#ABAEF9',
          500: '#5B6BF0',
          600: '#4857D8',
          700: '#3645B4',
          800: '#262F8A',
          900: '#1A2066',
        },
        teal: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          DEFAULT: '#0D9488',
          600: '#0F766E',
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#F7F8FA',
          100: '#EEF0F5',
          200: '#DCDFE8',
          400: '#8A93A1',
          500: '#636B78',
          700: '#2B2D42',
        },
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        revealUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(91,107,240,0.35)' },
          '70%': { boxShadow: '0 0 0 12px rgba(91,107,240,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(91,107,240,0)' },
        },
        growBar: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        blink: 'blink 2s ease infinite',
        floatY: 'floatY 6s ease-in-out infinite',
        floatYDelayed: 'floatY 6s ease-in-out -3s infinite',
        revealUp: 'revealUp 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        slideIn: 'slideIn 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        fadeIn: 'fadeIn 0.5s ease both',
        pulseRing: 'pulseRing 2s ease infinite',
      },
    },
  },
  plugins: [],
}
