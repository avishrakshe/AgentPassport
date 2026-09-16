import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        monad: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#836ef9",
          600: "#6d52f6",
          700: "#5538e2",
          900: "#1b143f",
          deep: "#0f0b24",
        },
        limeAccent: {
          DEFAULT: "#c6ff00",
          hover: "#b2e600",
          light: "#f7fee7",
          border: "#bef264",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
