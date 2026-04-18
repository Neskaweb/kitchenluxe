import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native Node.js modules — must be excluded from Turbopack bundling
  serverExternalPackages: ['@resvg/resvg-js', 'sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
