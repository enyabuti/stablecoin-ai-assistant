/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq", "ioredis"]
  },
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
  // Reduce build memory usage
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@sentry/nextjs');
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