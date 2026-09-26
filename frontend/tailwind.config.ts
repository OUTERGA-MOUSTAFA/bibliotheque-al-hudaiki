import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        darkMode: 'class',
        // ============ BRAND ============
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',  // light
          600: '#059669',  // main ⭐
          700: '#047857',  // dark
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // ============ GOLD (Enfants) ============
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // main ⭐
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // ============ CORAL (Playful) ============
        coral: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',  // main ⭐
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // ============ SKY (Étudiants) ============
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // main ⭐
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // ============ NEUTRES WARMS ============
        cream: '#faf8f5',
        sand:  '#f5f1e8',
        ink:   '#1c1917',
        night: '#0c0a09',
      },
      fontFamily: {
        latin: ['var(--font-latin)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
        'arabic-alt': ['var(--font-arabic-alt)', 'system-ui', 'sans-serif'],
        'arabic-tech': ['var(--font-arabic-tech)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0c0a09 0%, #064e3b 50%, #0c0a09 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'cream-gradient': 'linear-gradient(180deg, #faf8f5 0%, #f5f1e8 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(28, 25, 23, 0.08)',
        'soft-lg': '0 10px 40px -8px rgba(28, 25, 23, 0.12)',
        'gold-glow': '0 8px 24px -6px rgba(245, 158, 11, 0.35)',
        'brand-glow': '0 8px 24px -6px rgba(5, 150, 105, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;