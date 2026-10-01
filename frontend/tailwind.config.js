/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          card: '#FFFFFF',
          // Fallbacks for any existing surface tokens
          950: '#F8FAFC',
          900: '#FFFFFF',
          850: '#FFFFFF',
          800: '#F8FAFC',
          750: '#F1F5F9',
          700: '#E2E8F0',
          600: '#CBD5E1',
        },
        brand: {
          50: '#F0F7FC',
          100: '#E1EFF8',
          200: '#B9DCF0',
          300: '#80C0E4',
          400: '#339BD3',
          500: '#007ABF',
          600: '#005A9C', // Cleveland Clinic Primary Blue
          700: '#00477D',
          800: '#003B64',
          900: '#002642',
        },
        accent: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',
          600: '#00843D', // Cleveland Clinic Cross Green
          700: '#00662F',
          teal: '#0F9D8B',
          cyan: '#0284C7',
          violet: '#6366F1',
        }
      },
      boxShadow: {
        'clinic': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        'clinic-md': '0 4px 16px -2px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.03)',
        'clinic-lg': '0 10px 28px -4px rgb(0 0 0 / 0.08), 0 4px 10px -2px rgb(0 0 0 / 0.04)',
        'clinic-hover': '0 10px 25px -4px rgb(0 90 156 / 0.12)',
        'glass': '0 4px 16px -2px rgb(0 0 0 / 0.05)',
        'glass-hover': '0 8px 24px -4px rgb(0 90 156 / 0.12)',
        'glow-brand': '0 4px 14px 0 rgb(0 90 156 / 0.25)',
        'glow-cyan': '0 4px 14px 0 rgb(2 132 199 / 0.25)',
        'glow-emerald': '0 4px 14px 0 rgb(0 132 61 / 0.25)',
        'glow-rose': '0 4px 14px 0 rgb(225 29 72 / 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
