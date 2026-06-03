/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF9F6',
          100: '#F4F1EA',
          200: '#E5E0D5',
          300: '#C5A880',
          400: '#78716C',
          500: '#2E2A25',
          600: '#1C1917',
          700: '#1B3B2B',
          800: '#12110E',
          900: '#12110E',
          950: '#12110E',
        },
        // Override standard colors to enforce the luxury color palette
        slate: {
          50: '#FAF9F6', // Warm Ivory
          100: '#F4F1EA', // Sand Beige
          200: '#E5E0D5', // Soft Warm Gray border
          300: '#A8A29E', // Muted Gray
          400: '#78716C', // Stone Gray
          500: '#44403C', // Warm Graphite
          600: '#2E2A25', // Graphite
          700: '#1C1917', // Charcoal
          800: '#1E1C19', // Dark Warm Brown
          900: '#151412', // Warm Black
          950: '#12110E', // Dark Wood
        },
        indigo: {
          50: '#FAF9F6', // Warm Ivory
          100: '#F4F1EA', // Sand Beige
          200: '#E5E0D5', // Soft border
          300: '#C5A880', // Elegant Gold Accent
          400: '#B09570', // Muted Gold Accent
          500: '#78716C', // Stone Gray
          600: '#1C1917', // Charcoal
          700: '#2E2A25', // Graphite
          800: '#1B3B2B', // Forest Green
          900: '#151412', // Warm Black
          950: '#12110E', // Dark Wood
        },
        purple: {
          50: '#FAF9F6', // Warm Ivory
          100: '#F4F1EA', // Sand Beige
          200: '#E5E0D5',
          300: '#C5A880', // Gold Accent
          400: '#B09570', // Muted Gold
          500: '#C5A880', // Gold Accent
          600: '#A4865E', // Darker Gold Accent
          700: '#2E2A25',
          800: '#1B3B2B', // Forest Green
          900: '#151412',
          950: '#12110E',
        },
        teal: {
          50: '#FAF9F6', // Warm Ivory
          100: '#F4F1EA', // Sand Beige
          200: '#E5E0D5',
          300: '#C5A880', // Gold Accent
          400: '#B09570',
          500: '#1B3B2B', // Forest Green
          600: '#1B3B2B', // Forest Green
          700: '#152E22', // Darker Forest Green
          800: '#12110E',
          900: '#12110E',
          950: '#12110E',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(197, 168, 128, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

