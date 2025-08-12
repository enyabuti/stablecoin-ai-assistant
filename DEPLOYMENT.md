# Deployment Guide

This guide will help you deploy your Stablecoin AI Assistant to production with CI/CD.

## Quick Deploy to Vercel (Recommended)

### 1. Database Setup (Choose One)

**Option A: Supabase (Recommended)**
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Copy your connection string from Settings > Database
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

**Option B: Neon**
1. Go to [Neon](https://neon.tech)
2. Create new project
3. Copy connection string

**Option C: Railway**
1. Go to [Railway](https://railway.app)
2. Create PostgreSQL service
3. Copy connection string

### 2. Redis Setup (Choose One)

**Option A: Upstash (Recommended)**
1. Go to [Upstash](https://upstash.com)
2. Create Redis database
3. Copy connection string

**Option B: Railway Redis**
1. Add Redis service to your Railway project
2. Copy connection string

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fstablecoin-ai)

**Manual Deployment:**

1. **Fork this repository** on GitHub

2. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables in Vercel:**
   Go to your Vercel dashboard > Project > Settings > Environment Variables

   **Required Variables:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   REDIS_URL=redis://user:password@host:6379
   NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

   **Optional Variables:**
   ```
   CIRCLE_API_KEY=your-circle-api-key
   OPENAI_API_KEY=your-openai-api-key
   SENTRY_DSN=your-sentry-dsn
   USE_CIRCLE_API=false
   USE_MOCK_APIS=true
   ENABLE_CCTP=false
   ```

4. **Set up GitHub Integration:**
   - Connect your GitHub repository in Vercel
   - Enable automatic deployments from main branch

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. **Tests on every PR/push:**
   - Runs linting and type checking
   - Executes unit tests with Vitest
   - Runs E2E tests with Playwright
   - Builds the application

2. **Deploys on main branch:**
   - Automatically deploys to Vercel production
   - Runs database migrations
   - Updates environment variables

### GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
```

**To get these values:**
1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Create new token
3. Get Org ID and Project ID from Vercel dashboard

## Database Migration

The app will automatically run Prisma migrations on deployment. For manual migration:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Monitoring & Error Tracking

### Sentry Setup (Recommended)

1. Create account at [Sentry.io](https://sentry.io)
2. Create new Next.js project
3. Copy DSN and add to environment variables:
   ```
   SENTRY_DSN=your-sentry-dsn
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=your-token
   ```

### Health Checks

Monitor your deployment:
- Health endpoint: `https://your-domain.vercel.app/api/health`
- Check database, Redis, and API status

## Environment Variables Reference

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `NEXTAUTH_SECRET` - Random 32+ character string
- `NEXTAUTH_URL` - Your production URL

### Optional
- `CIRCLE_API_KEY` - Circle Programmable Wallets API key
- `OPENAI_API_KEY` - OpenAI API key for LLM features
- `SENTRY_DSN` - Sentry error tracking
- `USE_CIRCLE_API` - Enable real Circle API (default: false)
- `USE_MOCK_APIS` - Use mock providers (default: true)
- `ENABLE_CCTP` - Enable Cross-Chain Transfer Protocol

## Scaling Considerations

### Background Jobs
- The app uses BullMQ for job processing
- In production, consider:
  - Separate worker processes
  - Job queue monitoring
  - Redis persistence

### Database
- Enable connection pooling
- Set up read replicas for heavy traffic
- Monitor query performance

### Performance
- Enable Vercel Edge Functions for API routes
- Use Vercel Image Optimization
- Implement caching strategies

## Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check environment variables are set
   - Verify database connection
   - Review build logs in Vercel

2. **Database Connection Issues:**
   - Verify connection string format
   - Check firewall settings
   - Test connection locally

3. **Redis Issues:**
   - Verify Redis URL format
   - Check Redis service status
   - Test connection with Redis CLI

### Getting Help

1. Check the health endpoint: `/api/health`
2. Review Vercel deployment logs
3. Check Sentry for error details
4. Open an issue on GitHub

## Security Checklist

- [ ] All secrets are in environment variables
- [ ] Database has proper access controls
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies are up to date