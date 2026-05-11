/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        piano: {
          black: '#121212',
          white: '#ffffff',
          key: {
            white: '#f8f9fa',
            black: '#212529',
            activeWhite: '#e9ecef',
            activeBlack: '#343a40',
          },
          accent: '#0ea5e9', // Sky blue accent
        }
      },
      boxShadow: {
        'key-white': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -3px 5px rgba(0,0,0,0.2)',
        'key-black': '0 4px 6px -1px rgba(0, 0, 0, 0.4), inset 0 -3px 5px rgba(0,0,0,0.5)',
        'key-white-active': '0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 2px 4px rgba(0,0,0,0.2)',
        'key-black-active': '0 1px 2px 0 rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0,0,0,0.5)',
        'glow': '0 0 15px rgba(14, 165, 233, 0.5)',
      }
    },
  },
  plugins: [],
}
