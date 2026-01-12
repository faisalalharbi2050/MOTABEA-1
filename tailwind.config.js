/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          50: '#f5f3ff', // Ultra light generated from #e5e1fe base
          100: '#e5e1fe', // User Lightest
          200: '#d0ccfd', // Generated intermediate
          300: '#a79bfb', // Generated intermediate
          400: '#8779fb', // User Medium
          500: '#7566f1', // Generated intermediate
          600: '#655ac1', // User Darkest
          700: '#5348a0', // Generated darker
          800: '#433b82', // Generated darker
          900: '#383366', // Generated darker
          950: '#262244', // Generated darker
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        motabea: {
          blue: {
            light: '#e5e1fe', // Updated to match new light
            DEFAULT: '#8779fb', // Updated to match new medium
            dark: '#655ac1', // Updated to match new dark
          },
          gray: {
            light: '#f1f5f9',
            DEFAULT: '#64748b',
            dark: '#334155',
          },
        },
        // New Brand Colors
        brand: {
            dark: '#655ac1', // User Darkest
            main: '#8779fb', // User Medium
            light: '#e5e1fe', // User Lightest
        },
      },
      fontFamily: {
        'arabic': ['Noto Kufi Arabic', 'system-ui', 'sans-serif'],
        'kufi': ['Noto Kufi Arabic', 'system-ui', 'sans-serif'],
        'sans': ['system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'marquee': 'marquee 80s linear infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
