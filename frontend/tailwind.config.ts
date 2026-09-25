import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        latin: ['var(--font-latin)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
        'arabic-alt': ['var(--font-arabic-alt)', 'system-ui', 'sans-serif'],
        'arabic-tech': ['var(--font-arabic-tech)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;