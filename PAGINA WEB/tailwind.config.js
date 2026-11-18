/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alpine: {
          night: '#0b0f14',
          slate: '#1a2633',
          steel: '#2f4a5d',
          ice: '#7aa6c2',
          snow: '#e6f2fb',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'Oswald', 'sans-serif'],
        impact: ['Oswald', 'Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 12px 40px -8px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(230, 242, 251, 0.14)',
        'glow-alpine': '0 0 30px rgba(122, 166, 194, 0.38)',
        'glow-snow': '0 0 28px rgba(230, 242, 251, 0.25)',
      },
    },
  },
  plugins: [],
}
