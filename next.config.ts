import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // Only apply security headers to non-API routes
  async headers() {
    return [
      {
        // Apply security headers to all non-API routes
        source: '/((?!api).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;