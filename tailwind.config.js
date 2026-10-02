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
      // Both scales are driven by CSS variables set per [data-theme] block in
      // src/index.css, so a theme change recolors the *whole* UI — not just the
      // accent. `amber` is the accent ramp, `stone` the neutral ramp.
      // Values are space-separated RGB triples, which keeps every alpha variant
      // (`bg-stone-200/80`, `dark:text-amber-400`) working as-is.
      colors: {
        amber: {
          50: 'rgb(var(--acc-50) / <alpha-value>)',
          100: 'rgb(var(--acc-100) / <alpha-value>)',
          200: 'rgb(var(--acc-200) / <alpha-value>)',
          300: 'rgb(var(--acc-300) / <alpha-value>)',
          400: 'rgb(var(--acc-400) / <alpha-value>)',
          500: 'rgb(var(--acc-500) / <alpha-value>)',
          600: 'rgb(var(--acc-600) / <alpha-value>)',
          700: 'rgb(var(--acc-700) / <alpha-value>)',
          800: 'rgb(var(--acc-800) / <alpha-value>)',
          900: 'rgb(var(--acc-900) / <alpha-value>)',
          950: 'rgb(var(--acc-950) / <alpha-value>)',
        },
        stone: {
          50: 'rgb(var(--neu-50) / <alpha-value>)',
          100: 'rgb(var(--neu-100) / <alpha-value>)',
          200: 'rgb(var(--neu-200) / <alpha-value>)',
          300: 'rgb(var(--neu-300) / <alpha-value>)',
          400: 'rgb(var(--neu-400) / <alpha-value>)',
          500: 'rgb(var(--neu-500) / <alpha-value>)',
          600: 'rgb(var(--neu-600) / <alpha-value>)',
          700: 'rgb(var(--neu-700) / <alpha-value>)',
          800: 'rgb(var(--neu-800) / <alpha-value>)',
          900: 'rgb(var(--neu-900) / <alpha-value>)',
          950: 'rgb(var(--neu-950) / <alpha-value>)',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.35)',
        glow: '0 0 25px -5px rgb(var(--acc-600) / 0.2)',
      },
    },
  },
  plugins: [],
};
