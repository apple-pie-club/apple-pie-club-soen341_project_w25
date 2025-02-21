import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
