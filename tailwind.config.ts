import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: '#3b82f6',
        sky: '#5eceeb',
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', 'PingFang SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
