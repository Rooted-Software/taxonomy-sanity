const { colors } = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './ui/**/*.{ts,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './plugins/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        ...colors,
        brand: {
          50: '#f3fp3f3',
          100: '#e7e7e7',
          200: '#c4c4c4',
          300: '#a0a0a0',
          400: '#585858',
          500: '#111111',
          600: '#0f0f0f',
          700: '#0d0d0d',
          800: '#0a0a0a',
          900: '#080808',
          DEFAULT: '#111111',
        },
        'dark': '#1B2637',
        'whiteSmoke': '#F5F5F5',
        'tightWhite': '#E8F1FB',
        'eggshell': '#E9E9E9',
        'accent': '#6BE4BC',
        'accent-1': '#6BE4BC',
        'accent-2': '#EAEAEA',
        'accent-7': '#333',
        green: '#246b10',
        success: '#0070f3',
        cyan: '#79FFE1',
        'blue-500': '#2276FC',
        'yellow-100': '#fef7da',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        boxShadow: {
          small: '0 5px 10px rgba(0, 0, 0, 0.12)',
          medium: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        fontSize: {
          '5xl': '2.5rem',
          '6xl': '2.75rem',
          '7xl': '4.5rem',
          '8xl': '6.25rem',
        },
        lineHeight: {
          tight: 1.2,
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        spacing: {
          28: '7rem',
        },
        letterSpacing: {
          tighter: '-.04em',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
 
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
