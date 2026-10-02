/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0097a7',
          darkTeal: '#00838f',
          lightTeal: '#e0f7fa',
          green: '#00796b',
          lightGreen: '#e8f5e9',
          purple: '#5e35b1',
          lightPurple: '#ede7f6',
          brown: '#8d6e63',
          darkBrown: '#5d4037',
          lightBrown: '#efebe9',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
