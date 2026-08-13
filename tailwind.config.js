/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Une seule couleur d'accent dans toute l'application.
        accent: {
          DEFAULT: '#1d4ed8',
          soft: '#eff4ff',
          line: '#c7d7fe',
        },
        ink: '#111827',
        muted: '#6b7280',
        hair: '#e5e7eb',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        num: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
