/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f7',
          100: '#fee8ea',
          200: '#fdd5db',
          300: '#fbb4c1',
          400: '#f7849d',
          500: '#f0537a',
          600: '#e63462',
          700: '#C73866',
          800: '#a91e4a',
          900: '#8f1c42',
          950: '#500d20',
        },
        secondary: {
          50: '#fef5f3',
          100: '#fee9e7',
          200: '#fed7d4',
          300: '#fcb8b3',
          400: '#f98b85',
          500: '#FE676E',
          600: '#f23d4a',
          700: '#e12d3c',
          800: '#bc2532',
          900: '#9d242f',
          950: '#561015',
        },
        accent: {
          50: '#fef6f0',
          100: '#feebe0',
          200: '#fdd4c1',
          300: '#fbb596',
          400: '#f98e69',
          500: '#FD8F52',
          600: '#ed5f1e',
          700: '#c64716',
          800: '#9e3817',
          900: '#7f3016',
          950: '#44160a',
        },
        warm: {
          50: '#fffcf5',
          100: '#fef8ea',
          200: '#fdefd0',
          300: '#fce0a6',
          400: '#FFBD71',
          500: '#f9a949',
          600: '#ea8a1f',
          700: '#c36d16',
          800: '#9b5517',
          900: '#7c4715',
          950: '#432309',
        },
        light: {
          50: '#FFDCA2',
          100: '#ffd699',
          200: '#ffce85',
          300: '#ffc266',
          400: '#ffb347',
          500: '#ff9f1a',
          600: '#e6820a',
          700: '#cc6600',
          800: '#994d00',
          900: '#663300',
          950: '#4d2600',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right top'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgba(216, 48, 48, 0.2), 0 0 10px rgba(216, 48, 48, 0.2), 0 0 15px rgba(216, 48, 48, 0.2)' },
          '100%': { 'box-shadow': '0 0 10px rgba(216, 48, 48, 0.4), 0 0 20px rgba(216, 48, 48, 0.4), 0 0 30px rgba(216, 48, 48, 0.4)' }
        }
      },
    },
  },
  plugins: [],
} 