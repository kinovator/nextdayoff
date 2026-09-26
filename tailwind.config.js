export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EBE3D7',
          300: '#DCD1C0',
          400: '#C4B59F',
          500: '#9E8E77',
          600: '#7B6C57',
          700: '#5F5242',
          800: '#43392E',
          900: '#2A231C',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.25)',
        glow: '0 0 25px -5px rgba(217, 119, 6, 0.2)',
      },
    },
  },
  plugins: [],
};
