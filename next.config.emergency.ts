import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for emergency deployment
  compress: true,
  poweredByHeader: false,
  
  // Disable problematic features
  images: {
    unoptimized: true,
  },
  
  // Skip build-time optimizations that might cause issues
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;