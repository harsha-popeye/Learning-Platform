import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { primary: '#3B82F6', canvas: '#F8FAFC', ink: '#0F172A', muted: '#64748B' } } }, plugins: [require('tailwindcss-animate')] };
export default config;
