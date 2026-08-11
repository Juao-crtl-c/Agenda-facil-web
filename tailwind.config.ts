import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F7F5",
        surface: "#FFFFFF",
        ink: "#1C1F26",
        "ink-soft": "#5B5F6B",
        border: "#E4E2DC",
        accent: {
          DEFAULT: "#2F6F5E",
          soft: "#E7F0EC",
        },
        debit: {
          DEFAULT: "#A6512E",
          soft: "#F5E9E2",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
