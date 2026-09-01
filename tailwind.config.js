/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#F6F4EF",
          900: "#FAFAF8",
          800: "#EFEDE7",
          700: "#DDDAD1",
          600: "#C7C3B8",
          500: "#8D8878",
        },
        // Deep marine-navy chrome — sidebar, header, and other fixed
        // structural surfaces. Distinct from `ink` (the warm paper tone
        // used for content surfaces), so light content cards keep good
        // contrast against a dark instrument-panel frame.
        navy: {
          900: "#0E2233",
          800: "#15304A",
          700: "#1D3F5F",
          600: "#2C5478",
          500: "#3D6C93",
        },
        chart: {
          line: "#DDDAD1",
          text: "#8D8878",
        },
        signal: {
          bunker: "#0D9488",   // teal-600 — STS Bunkering
          supply: "#B45309",   // amber-700 — STS Supply
          warn: "#D97706",
          crit: "#DC2626",
          ok: "#16A34A",
        },
        paper: {
          100: "#161B22",
          300: "#3D4550",
          500: "#6B7280",
        },
        // Marine flag-blue — the operator's primary action colour. Chosen
        // to sit tonally between navy and the bunker teal rather than the
        // generic Tailwind indigo, so it reads as this product's own
        // identity, not a template default.
        brand: {
          500: "#1B4965",
          600: "#123449",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}
