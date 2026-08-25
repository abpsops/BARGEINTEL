/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#FFFFFF",
          900: "#F7F9FC",
          800: "#EEF2F7",
          700: "#E2E8F0",
          600: "#CBD5E1",
          500: "#94A3B8",
        },
        chart: {
          line: "#E2E8F0",
          text: "#64748B",
        },
        signal: {
          bunker: "#0F8A80",   // deeper radar teal — STS Bunkering, readable on white
          supply: "#A8721E",   // deeper brass gold — STS Supply
          warn: "#B45309",
          crit: "#B91C1C",
          ok: "#15803D",
        },
        paper: {
          100: "#0B1220",
          300: "#334155",
          500: "#64748B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "sounding-line":
          "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 8px)",
      },
    },
  },
  plugins: [],
}
