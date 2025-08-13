# Ferrow

Ferry funds across chains, automatically.

A minimal, secure, production-quality MVP for AI-powered stablecoin automation that runs locally with mocked services by default and can connect to Circle Programmable Wallets in minutes.

## ✨ Features

- **Natural Language Rule Creation**: Chat-based interface to create automation rules
- **Multi-Chain Support**: Ethereum, Base, Arbitrum, Polygon with intelligent routing
- **Secure Architecture**: Feature flags, environment-based secrets, idempotency keys
- **Circle Integration**: Ready for Circle Programmable Wallets with mock fallback
- **Cross-Chain Ready**: Designed for Circle's CCTP (Cross-Chain Transfer Protocol)
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, BullMQ
- **Production Ready**: Docker compose, job queues, webhooks, comprehensive testing

## 🏗️ Architecture

```
├── Frontend: Next.js 14 + TypeScript + Tailwind + shadcn/ui
├── Backend: Next.js API routes + BullMQ job queues  
├── Database: PostgreSQL + Prisma ORM
├── Queue: Redis + BullMQ for background jobs
├── AI: Pluggable LLM providers (OpenAI, mock)
├── Blockchain: Circle API + mock adapters
└── Testing: Playwright E2E + Vitest unit tests
```

## 🚀 Quick Start

### 🌐 Deploy to Production (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fstablecoin-ai-assistant)

**Or manual deployment:**
1. Fork this repository
2. Connect to Vercel
3. Set environment variables (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. Deploy automatically via GitHub integration

📖 **Full deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### 💻 Local Development

**Prerequisites:**
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone and Install

```bash
git clone <repo-url>
cd stablecoin-ai
npm install
```

### 2. Start Services

```bash
# Start PostgreSQL and Redis
docker compose -f infra/docker-compose.yml up -d

# Wait for services to be ready
sleep 5
```

### 3. Set Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://stablecoin:stablecoin_dev@localhost:5432/stablecoin_ai"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags (Start with mocks)
USE_CIRCLE=false
USE_MOCKS=true  
ENABLE_CCTP=false

# Optional: Add real API keys later
# CIRCLE_API_KEY=""
# OPENAI_API_KEY=""
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 🔄 CI/CD Pipeline

This project includes a robust CI/CD pipeline that **prevents breaking changes** and ensures reliable deployments:

### ✅ Automated Quality Checks
- **Linting & Type Safety**: ESLint and TypeScript validation
- **Unit Tests**: Vitest with database integration tests
- **E2E Tests**: Playwright browser automation
- **Build Verification**: Ensures production builds succeed

### 🚀 Automatic Deployments
- **GitHub Integration**: Push to main → auto-deploy to Vercel
- **Preview Deployments**: Every PR gets a preview URL
- **Rollback Support**: Easy rollback to previous versions
- **Zero Downtime**: Vercel's edge network deployment

### 📊 Monitoring & Alerts
- **Health Checks**: `/api/health` endpoint monitors all services
- **Error Tracking**: Sentry integration for production errors
- **Performance Monitoring**: Real-time metrics and logging

**No more broken deployments!** The pipeline catches issues before they reach production.

## 🧪 Demo Script (90 seconds)

1. **Dashboard Overview** (15s)
   - Visit dashboard at [http://localhost:3000](http://localhost:3000)
   - See KPIs: Balance, Avg Fee, 24h Executions, Scheduled rules
   - View recent activity with mock transfer data

2. **Create Rule via Chat** (30s)
   - Click "New Rule" or navigate to `/rules/new`
   - Type: "Send $50 USDC to John every Friday at 8am on the cheapest chain"
   - Watch AI parse the natural language into structured JSON
   - See route quotes comparing Base ($0.05), Arbitrum ($0.50), Polygon ($0.10)

3. **Confirm Rule** (15s)
   - Click "Confirm & Schedule" on the recommended Base route
   - Rule is created and scheduled with cron expression
   - Navigate to Rules page to see active rule

4. **Execute Now** (15s)
   - Click "Execute Now" button to trigger manual execution
   - Job is queued and processed by background worker
   - Mock Circle API simulates USDC transfer

5. **View Results** (15s)
   - Visit Transfers page to see execution history
   - Check Settings page for system status
   - All services show "Connected/Running" status

## 🏃‍♂️ Running Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:seed           # Seed demo data

# Testing  
npm run test              # Run unit tests (Vitest)
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Lint code
npm run type-check      # TypeScript checking
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for NextAuth.js |
| `USE_CIRCLE` | ❌ | Enable real Circle API (default: false) |
| `USE_MOCKS` | ❌ | Enable mock providers (default: true) |
| `CIRCLE_API_KEY` | ❌ | Circle Programmable Wallets API key |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for GPT models |
| `NEXT_PUBLIC_APP_NAME` | ❌ | App name (default: Ferrow) |
| `NEXT_PUBLIC_APP_TAGLINE` | ❌ | App tagline (default: Ferry funds across chains, automatically.) |
| `NEXT_PUBLIC_APP_URL` | ❌ | App URL for metadata |

### Feature Flags

- `USE_CIRCLE=true`: Connect to real Circle Programmable Wallets
- `USE_MOCKS=false`: Disable mock services  
- `ENABLE_CCTP=true`: Enable Cross-Chain Transfer Protocol

### Circle Integration

1. Get API key from [Circle Developer Console](https://developers.circle.com/)
2. Set `CIRCLE_API_KEY` in `.env.local`
3. Set `USE_CIRCLE=true` and `USE_MOCKS=false`
4. Configure webhook endpoint: `https://yourdomain.com/api/webhooks/circle`

## 📊 Rule JSON Schema

The AI parses natural language into this structured format:

```typescript
{
  type: "schedule" | "conditional",
  asset: "USDC" | "EURC", 
  amount: {
    type: "fixed",
    value: number,
    currency: "USD" | "EUR"
  },
  destination: {
    type: "address" | "contact",
    value: string
  },
  schedule?: {
    cron: string,      // "0 8 * * FRI"
    tz: string         // "America/New_York"  
  },
  condition?: {
    metric: "EURUSD",  
    change: "+%" | "-%",
    magnitude: number,  // 2.0 for 2%
    window: "24h"
  },
  routing: {
    mode: "cheapest" | "fastest" | "fixed",
    allowedChains: ["ethereum", "base", "arbitrum", "polygon"]
  },
  limits: {
    dailyMaxUSD: number,
    requireConfirmOverUSD: number
  }
}
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Test coverage includes:
- LLM rule parsing logic
- Route calculation algorithms
- Database operations
- API endpoint validation

### E2E Tests

```bash
npm run test:e2e
```

E2E scenarios:
- Dashboard navigation and KPI display
- Chat-based rule creation flow
- Rule confirmation and scheduling 
- Transfer history viewing
- Settings configuration

## 🔐 Security

- **Secrets Management**: All sensitive data in environment variables
- **Idempotency**: Duplicate-safe execution with idempotency keys
- **Webhook Verification**: HMAC signature validation for Circle webhooks
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Feature Flags**: Safe rollout of new integrations

## 🏗️ Project Structure

```
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (dashboard)/       # Dashboard layout and pages
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── rules/         # Rules management
│   │   │   ├── transfers/     # Transfer history  
│   │   │   └── settings/      # Settings page
│   │   └── api/               # API routes
│   │       ├── chat/parse/    # LLM rule parsing
│   │       ├── rules/         # Rule CRUD operations
│   │       └── webhooks/      # Circle webhooks
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ChatComposer.tsx  # Chat interface
│   │   ├── QuoteCard.tsx     # Route quotes
│   │   └── Layout.tsx        # Main layout
│   └── lib/                  # Core libraries
│       ├── llm/              # AI rule parsing
│       ├── routing/          # Chain routing logic
│       ├── circle/           # Circle API client
│       ├── mocks/            # Mock implementations
│       └── jobs/             # Background job system
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Demo data seeding
├── infra/
│   └── docker-compose.yml   # Local infrastructure
└── tests/
    ├── e2e/                 # Playwright tests
    └── unit/                # Vitest tests
```

## 🛠️ Customization

### Adding New LLM Providers

1. Implement the `LLMProvider` interface:

```typescript
class CustomLLMProvider implements LLMProvider {
  async parseRule(input: string): Promise<RuleJSON | { error: string }> {
    // Your implementation
  }
}
```

2. Register in `src/lib/llm/parser.ts`

### Adding New Chains

1. Update `src/lib/routing/chains.ts`:

```typescript
export const CHAIN_CONFIG = {
  // ... existing chains
  optimism: {
    name: "Optimism",
    shortName: "OP",
    chainId: 10,
    blockTime: 2,
    color: "#FF0420",
    icon: "🔴",
    explorerUrl: "https://optimistic.etherscan.io",
  },
}
```

2. Update the schema in `src/lib/llm/schema.ts`

### Custom Routing Logic

Extend `src/lib/routing/router.ts` with your own routing strategies:

```typescript
class CustomRouter implements Router {
  async getBestRoute(rule: RuleJSON): Promise<RouteQuote> {
    // Your custom routing logic
  }
}
```

## 📈 Production Deployment

### Environment Setup

1. **Database**: Use managed PostgreSQL (Supabase, Railway, etc.)
2. **Redis**: Use managed Redis (Upstash, Railway, etc.)  
3. **Hosting**: Deploy to Vercel, Railway, or self-hosted
4. **Monitoring**: Add APM and error tracking

### Required Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://user:pass@host:6379"
NEXTAUTH_SECRET="production-secret-minimum-32-chars"
CIRCLE_API_KEY="your-production-circle-key"
CIRCLE_ENTITY_SECRET="your-circle-entity-secret"
CIRCLE_WEBHOOK_SECRET="your-webhook-secret"
USE_CIRCLE=true
USE_MOCKS=false
```

### Background Workers

For production, run background workers separately:

```bash
node -r ts-node/register src/lib/jobs/worker.ts
```

Or use a process manager like PM2:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'stablecoin-web',
      script: 'npm',
      args: 'start'
    },
    {
      name: 'stablecoin-worker', 
      script: 'tsx',
      args: 'src/lib/jobs/worker.ts'
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

Built with ❤️ using Next.js, TypeScript, and Circle's Programmable Wallets.