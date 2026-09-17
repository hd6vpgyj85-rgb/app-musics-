/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b10',
        elevated: '#121218',
        surface: '#181820',
        surface2: '#1f1f2a',
        border: {
          DEFAULT: '#26262f',
          subtle: '#1b1b23',
        },
        text: {
          DEFAULT: '#f4f4f6',
          muted: '#9d9dad',
          faint: '#6b6b7a',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          50: '#f3efff',
          100: '#e4d9ff',
          400: '#a684ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6a2fd0',
        },
        accent2: {
          DEFAULT: '#ec4899',
          500: '#ec4899',
          600: '#db2777',
        },
        success: '#22c55e',
        danger: '#f87171',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(0,0,0,0.24)',
        elevated: '0 8px 24px -4px rgba(0,0,0,0.45)',
        glow: '0 0 0 1px rgba(139,92,246,0.4), 0 8px 32px -8px rgba(139,92,246,0.5)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.18) 100%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
        spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.4,0,0.2,1)',
        'slide-up': 'slide-up 260ms cubic-bezier(0.4,0,0.2,1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.4,0,0.2,1)',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        spin: 'spin 8s linear infinite',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
}
