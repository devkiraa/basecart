/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        baseBg: "var(--color-bg)",
        baseBgSubtle: "var(--color-bg-subtle)",
        basePrimary: "var(--color-primary)",
        basePrimaryHover: "var(--color-primary-hover)",
        basePrimarySubtle: "var(--color-primary-subtle)",
        baseText: "var(--color-text)",
        baseTextMuted: "var(--color-text-muted)",
        baseBorder: "var(--color-border)",
        baseSuccess: "var(--color-success)",
        baseError: "var(--color-error)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
