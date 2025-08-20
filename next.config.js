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
  // Reduce build memory usage and exclude problematic packages
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Exclude packages that cause build issues in server environment
      config.externals.push(
        '@sentry/nextjs',
        '@sentry/utils',
        '@opentelemetry/api'
      );
    }
    
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;