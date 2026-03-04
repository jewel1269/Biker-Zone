/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light Polaris-ish accent (ServiceNow-ish blue)
        primary: "#0B5FFF",
        "primary-dark": "#0847BE",
        "secondary-dark": "#0b1220",
        "grey-dark": "#1f2937",
        "grey-light": "#f8fafc",
        default: "#0f172a",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
};