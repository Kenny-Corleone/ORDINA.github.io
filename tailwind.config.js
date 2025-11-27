/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.js",
    "./src/**/*.html"
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899',
        accent: '#f59e0b',
        gold: {
          primary: '#F4C430',
          light: '#fbbf24',
          dark: '#d97706',
        },
      },
      borderRadius: {
        'card-xl': '20px',
        'card-md': '14px',
        'card-sm': '10px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Disable unused variants to reduce CSS size
  safelist: [],
}

