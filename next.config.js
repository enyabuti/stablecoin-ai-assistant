/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq", "ioredis"]
  },
  // Skip static generation during build for problematic routes
  trailingSlash: false,
  skipMiddlewareUrlNormalize: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // Optimize build for production deployment
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: false,
  }),
  // Skip build-time static generation for problematic routes
  ...(process.env.VERCEL && {
    generateBuildId: async () => {
      return 'vercel-build-' + Date.now()
    }
  }),
  // Minimal webpack config for Render.com compatibility
  webpack: (config, { isServer }) => {
    // Only apply minimal optimizations to avoid startup issues
    if (isServer) {
      config.externals.push('@sentry/nextjs');
    }
    
    return config;
  },
};

module.exports = nextConfig;