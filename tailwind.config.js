/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        aurora: 'aurora 60s linear infinite',
        'aurora-smooth': 'aurora 80s linear infinite',
        'aurora-slow': 'aurora-slow 100s linear infinite',
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        'aurora-slow': {
          '0%': {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          '100%': {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
