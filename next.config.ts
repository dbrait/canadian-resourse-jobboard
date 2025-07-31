import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO and performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
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

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/jobs/:path*',
        has: [
          {
            type: 'query',
            key: 'page',
            value: '1',
          },
        ],
        destination: '/jobs/:path*',
        permanent: true,
      },
    ]
  },

  // Experimental features for performance
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
