import type { Config } from "tailwindcss";

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: withOpacity("--color-canvas"),
        surface: withOpacity("--color-surface"),
        card: withOpacity("--color-card"),
        border: withOpacity("--color-border"),
        brand: {
          50: "#e7f3ff",
          100: "#cde7ff",
          200: "#9fd0ff",
          300: "#6fb5ff",
          400: "#39a4ff",
          500: "#1e8cff",
          600: "#0d6cd4",
          700: "#0b56a4",
          800: "#0a4176",
          900: "#082c4d"
        },
        text: {
          primary: withOpacity("--color-text-primary"),
          secondary: withOpacity("--color-text-secondary"),
          muted: withOpacity("--color-text-muted")
        },
        success: withOpacity("--color-success"),
        warning: withOpacity("--color-warning")
      }
    }
  },
  plugins: []
};

export default config;
