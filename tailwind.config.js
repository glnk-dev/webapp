/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideHorizontal: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        sparkle: {
          "0%, 100%": { opacity: 0, transform: "scale(0.5)" },
          "50%": { opacity: 1, transform: "scale(1.2)" },
        },
      },
      animation: {
        "slide-horizontal": "slideHorizontal 15s linear infinite",
        sparkle: "sparkle 1.2s infinite",
      },
      colors: {
        "footer-bg": "#121212", // Dark background
        "sparkle-gold": "#ffd700", // Vibrant gold
        "sparkle-pink": "#ff007f", // Bright pink
      },
    },
  },
  plugins: [],
};
