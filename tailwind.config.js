module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./blogs/**/*.html', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require("tailwindcss-animate")],
}
