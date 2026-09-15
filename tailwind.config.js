/** @type {import('tailwindcss').Config} */
module.exports = {
    // `overline` is a Tailwind utility; without this an app's own eyebrow-label class draws a line above the text.
    blocklist: ["overline"],
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
      './src/**/*.{js,jsx}',
      './lib/**/*.{js,jsx}',
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px'
        }
      },
      extend: {
        fontFamily: {
          sans: ['var(--font-dm-sans)', 'Arial', 'sans-serif'],
        },
        colors: {
          forest: '#153e35',
          lime: '#d9ee9f',
          lavender: '#eee9f8',
          peach: '#fbefe4',
          brand: { 50: '#f0f6ef', 100: '#e1eedb', 200: '#c8dfbc', 300: '#a8c5a3', 400: '#6d9f83', 500: '#428569', 600: '#24634c', 700: '#1c503e', 800: '#183f34', 900: '#153e35' },
          ink: { 50: '#f8f9f5', 100: '#f0f2eb', 200: '#e3e6dd', 300: '#cbd1c5', 400: '#929a8b', 500: '#6e786d', 600: '#566152', 700: '#404c3d', 800: '#2c392e', 900: '#20372b' },
          border: '#e3e6dd',
          input: '#dfe4d9',
          ring: '#24634c',
          background: '#fcfcf8',
          foreground: '#20372b',
          primary: {
            DEFAULT: '#24634c',
            foreground: '#ffffff'
          },
          secondary: {
            DEFAULT: '#eaf1e3',
            foreground: '#24634c'
          },
          destructive: {
            DEFAULT: '#be3450',
            foreground: '#ffffff'
          },
          muted: {
            DEFAULT: '#f1f3ed',
            foreground: '#6e786d'
          },
          accent: {
            DEFAULT: '#eaf1e3',
            foreground: '#24634c'
          },
          popover: {
            DEFAULT: '#ffffff',
            foreground: '#20372b'
          },
          card: {
            DEFAULT: '#ffffff',
            foreground: '#20372b'
          },
          chart: {
            '1': 'hsl(var(--chart-1))',
            '2': 'hsl(var(--chart-2))',
            '3': 'hsl(var(--chart-3))',
            '4': 'hsl(var(--chart-4))',
            '5': 'hsl(var(--chart-5))'
          },
          sidebar: {
            DEFAULT: 'hsl(var(--sidebar-background))',
            foreground: 'hsl(var(--sidebar-foreground))',
            primary: 'hsl(var(--sidebar-primary))',
            'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
            accent: 'hsl(var(--sidebar-accent))',
            'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
            border: 'hsl(var(--sidebar-border))',
            ring: 'hsl(var(--sidebar-ring))'
          }
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)'
        },
        keyframes: {
          'accordion-down': {
            from: {
              height: '0'
            },
            to: {
              height: 'var(--radix-accordion-content-height)'
            }
          },
          'accordion-up': {
            from: {
              height: 'var(--radix-accordion-content-height)'
            },
            to: {
              height: '0'
            }
          }
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out'
        }
      }
    },
    plugins: [require("tailwindcss-animate")],
  }