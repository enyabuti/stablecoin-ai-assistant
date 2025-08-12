#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$REDIS_URL" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Error: Required environment variables are not set."
    echo "Please set DATABASE_URL, REDIS_URL, and NEXTAUTH_SECRET"
    exit 1
fi

echo "✅ Environment variables check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run type checking  
echo "🔍 Running type check..."
npm run type-check

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Run tests
echo "🧪 Running tests..."
npm run test:unit

# Build the application
echo "🏗️ Building application..."
npm run build

# Deploy to Vercel
echo "☁️ Deploying to Vercel..."
if command -v vercel >/dev/null 2>&1; then
    vercel --prod
else
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    vercel --prod
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be live at your Vercel URL"