const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq"]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
  },
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);