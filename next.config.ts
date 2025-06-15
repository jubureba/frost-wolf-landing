/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'render.worldofwarcraft.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'wow.zamimg.com', port: '', pathname: '/images/wow/icons/large/**' },
    ],
  },
  experimental: {
    turbopack: true,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
