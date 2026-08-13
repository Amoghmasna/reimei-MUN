import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { navy: '#081A3A', crimson: '#6E0D1B', gold: '#D4AF37', ivory: '#F5F2E8' }, fontFamily: { display: ['Georgia', 'serif'], sans: ['Inter', 'Arial', 'sans-serif'] } } },
  plugins: []
};
export default config;
