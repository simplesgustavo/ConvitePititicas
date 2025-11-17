import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        chop: {
          50: "#fff9e6",
          100: "#ffeab0",
          200: "#ffdb7a",
          300: "#ffcc44",
          400: "#ffbd0e",
          500: "#e6a400",
          600: "#b37f00",
          700: "#805a00",
          800: "#4d3600",
          900: "#1a1100"
        },
        feijoada: "#1f1b1a",
        palmeira: "#1b7d48"
      }
    }
  },
  plugins: []
};

export default config;
