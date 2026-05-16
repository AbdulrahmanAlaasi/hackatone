/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hackatone/shared'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
