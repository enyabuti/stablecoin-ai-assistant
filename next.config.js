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
  // Reduce build memory usage and fix global issues
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Exclude packages that cause build issues in server environment
      config.externals.push(
        '@sentry/nextjs',
        '@sentry/utils',
        '@opentelemetry/api'
      );
      
      // Define globals that are expected by browser-only code
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'undefined',
          'window': 'undefined',
        })
      );
    }
    
    // Disable webpack runtime optimization for server to prevent self references
    if (isServer) {
      config.optimization.runtimeChunk = false;
      config.optimization.splitChunks = false;
    } else {
      // Only optimize for client-side bundle
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
    }
    
    return config;
  },
};

module.exports = nextConfig;