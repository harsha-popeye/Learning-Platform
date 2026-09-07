/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
module.exports = withPWA({
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] },
});
