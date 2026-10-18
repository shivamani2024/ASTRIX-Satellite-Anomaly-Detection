/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-invocation of canvas/websockets in dev
  transpilePackages: ['three'],
};

module.exports = nextConfig;
