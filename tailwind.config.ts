import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d1dbe6',
          300: '#a7bcd1',
          400: '#7797b9',
          500: '#5478a0',
          600: '#435e86',
          700: '#384d6d',
          800: '#31425b',
          900: '#2d3a4d',
          950: '#1e2632',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
