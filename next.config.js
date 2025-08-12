/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq"]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
};

module.exports = nextConfig;