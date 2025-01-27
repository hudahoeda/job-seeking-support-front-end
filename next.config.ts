import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mda-interview.sgp1.cdn.digitaloceanspaces.com',
      },
    ],
  },
};

export default nextConfig;
