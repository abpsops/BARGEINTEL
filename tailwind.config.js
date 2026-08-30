/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#FFFFFF",
          900: "#FAFAFA",
          800: "#F4F4F5",
          700: "#E4E4E7",
          600: "#D4D4D8",
          500: "#A1A1AA",
        },
        chart: {
          line: "#E4E4E7",
          text: "#71717A",
        },
        signal: {
          bunker: "#0D9488",   // teal-600 — STS Bunkering
          supply: "#B45309",   // amber-700 — STS Supply
          warn: "#D97706",
          crit: "#DC2626",
          ok: "#16A34A",
        },
        paper: {
          100: "#18181B",
          300: "#3F3F46",
          500: "#71717A",
        },
        brand: {
          500: "#6366F1",
          600: "#4F46E5",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}
