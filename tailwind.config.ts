import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        harbor: "#10242A",
        sand: "#F4EEE1",
        coral: { DEFAULT: "#E8734A", dark: "#C85A34" },
        moss: { DEFAULT: "#3E6259", light: "#DCE9E4" },
        gold: "#D9A441",
        mist: "#DCE4E0"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      },
      borderRadius: { xl2: "18px" },
      boxShadow: {
        card: "0 1px 2px rgba(16,36,42,0.06), 0 12px 32px -14px rgba(16,36,42,0.22)",
        cardDark: "0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -14px rgba(0,0,0,0.5)"
      }
    }
  },
  plugins: []
};
export default config;
