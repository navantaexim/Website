module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './blogs/*/.html'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require("tailwindcss-animate")],
}
