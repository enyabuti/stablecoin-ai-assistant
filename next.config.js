/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq"]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // Skip build-time static generation for problematic routes
  ...(process.env.VERCEL && {
    generateBuildId: async () => {
      return 'vercel-build'
    }
  })
};

module.exports = nextConfig;