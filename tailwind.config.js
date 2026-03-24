/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        corporate: {
          50: "#f4f6f8",
          100: "#e8ecf0",
          200: "#cfd6df",
          300: "#a8b4c4",
          400: "#7c8ca3",
          500: "#5f6f85",
          600: "#4a586b",
          700: "#3d4858",
          800: "#343e4c",
          900: "#1e2430",
          950: "#12161d",
        },
      },
      boxShadow: {
        corporate: "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 24px rgba(15, 23, 42, 0.04)",
        "corporate-lg": "0 4px 6px rgba(15, 23, 42, 0.05), 0 12px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
