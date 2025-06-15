import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'render.worldofwarcraft.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'wow.zamimg.com', port: '', pathname: '/images/wow/icons/large/**' },
    ],
  },
  webpack(config: Configuration) {
    config.resolve = {
      ...(config.resolve || {}),
      fallback: {
        ...(config.resolve?.fallback || {}),
        fs: false,
      },
    };
    return config;
  },
};

export default nextConfig;
