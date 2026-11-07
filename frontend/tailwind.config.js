/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Charcoal base
        base: {
          950: '#0c0c0c',
          900: '#111113',
          800: '#161618',
          700: '#1c1c1f',
          600: '#222226',
          500: '#2a2a2f',
        },
        // Glass surfaces
        surface: {
          DEFAULT: '#161618',
          hover:   '#1c1c1f',
          border:  'rgba(255,255,255,0.07)',
          muted:   'rgba(255,255,255,0.03)',
          glass:   'rgba(255,255,255,0.04)',
        },
        // Forest green accent
        green: {
          950: '#0a1f15',
          900: '#1a3d2e',
          800: '#2d6a4f',
          700: '#40916c',
          DEFAULT: '#52b788',
          light:   '#74c69d',
          muted:   'rgba(82,183,136,0.15)',
        },
        // Crimson accent
        crimson: {
          950: '#1a0a0a',
          900: '#3d1a1a',
          800: '#7f1d1d',
          700: '#c0392b',
          DEFAULT: '#e53e3e',
          light:   '#fc8181',
          muted:   'rgba(229,62,62,0.15)',
        },
        // Text hierarchy
        text: {
          primary:   '#f2f2f2',
          secondary: '#a0a0a8',
          muted:     '#5a5a62',
          inverse:   '#0c0c0c',
        },
        // Status per pipeline step
        status: {
          pending:   '#f59e0b',
          cloning:   '#3b82f6',
          building:  '#8b5cf6',
          pushing:   '#06b6d4',
          deploying: '#f97316',
          running:   '#52b788',
          failed:    '#e53e3e',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        glass:     '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'green-glow':   '0 0 20px rgba(82,183,136,0.12)',
        'crimson-glow': '0 0 20px rgba(229,62,62,0.12)',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
      },
      animation: {
        shimmer:    'shimmer 1.8s infinite linear',
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition:  '700px 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
