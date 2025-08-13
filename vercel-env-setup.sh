#!/bin/bash

# Set Vercel environment variables for production
echo "Setting up Vercel environment variables..."

# Database
echo "postgresql://postgres.fdwsouyxxcixiajzaayl:Ajoy@321EZmk@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true" | npx vercel env add DATABASE_URL production

# Direct database URL (for migrations)  
echo "postgresql://postgres.fdwsouyxxcixiajzaayl:Ajoy@321EZmk@aws-0-us-east-1.pooler.supabase.com:5432/postgres" | npx vercel env add DIRECT_URL production

# NextAuth
echo "b314681d3171ad4b2a614a047ed6c04a26fa4869eb6e42a72bae1a5657e9b93d" | npx vercel env add NEXTAUTH_SECRET production

# NextAuth URL (will need to be updated with actual domain)
echo "https://stablecoin-ai.vercel.app" | npx vercel env add NEXTAUTH_URL production

# Email (for magic links)
echo "noreply@ferrow.app" | npx vercel env add EMAIL_FROM production

# Feature flags
echo "false" | npx vercel env add USE_CIRCLE production
echo "true" | npx vercel env add USE_MOCKS production
echo "false" | npx vercel env add ENABLE_CCTP production
echo "production" | npx vercel env add NODE_ENV production

# Branding
echo "Ferrow" | npx vercel env add NEXT_PUBLIC_APP_NAME production
echo "Ferry funds across chains, automatically." | npx vercel env add NEXT_PUBLIC_APP_TAGLINE production
echo "https://stablecoin-ai.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables setup complete!"