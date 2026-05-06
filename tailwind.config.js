/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1670E8",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#0A2558",
        },
      },
      boxShadow: {
        card:       "0 1px 3px rgba(10,37,88,.07), 0 1px 2px rgba(10,37,88,.05)",
        "card-lg":  "0 8px 24px rgba(10,37,88,.11)",
        modal:      "0 24px 64px rgba(10,37,88,.18)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-in":   "fadeIn .2s ease",
        "slide-up":  "slideUp .25s ease",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" },             to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(12px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};
