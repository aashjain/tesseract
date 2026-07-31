import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Three.js and drei are large barrel packages; keep the client bundle lean.
    optimizePackageImports: ['@react-three/drei', 'three'],
  },
};

export default nextConfig;
