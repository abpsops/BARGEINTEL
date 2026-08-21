/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070B14",
          900: "#0B1220",
          800: "#111A2B",
          700: "#182338",
          600: "#22304A",
          500: "#33455F",
        },
        chart: {
          line: "#22304A",
          text: "#8593AD",
        },
        signal: {
          bunker: "#4FD1C5",   // radar teal — STS Bunkering
          supply: "#D9A441",   // brass gold — STS Supply
          warn: "#E0A526",
          crit: "#E0574A",
          ok: "#3FA66E",
        },
        paper: {
          100: "#F4F6FA",
          300: "#C7D0E0",
          500: "#8593AD",
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
