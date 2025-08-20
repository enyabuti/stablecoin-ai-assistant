# 📊 Ferrow - Visual System Architecture

## 🏗️ High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FERROW ARCHITECTURE                                │
│                    Ferry funds across chains, automatically                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │ Mobile Browser  │    │   API Clients   │
│                 │    │                 │    │                 │
│ React/Next.js   │    │ Responsive UI   │    │ REST/Webhooks   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│              PRESENTATION LAYER │                                 │
│                                 ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                Next.js 14 App Router                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │  │
│  │  │  Dashboard  │ │    Rules    │ │      Transfers      │   │  │
│  │  │    Home     │ │ Management  │ │      History        │   │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              shadcn/ui Components                      │ │  │
│  │  │     Mobile-First • Responsive • Accessible           │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   API Routes    │ │   Middleware    │ │  Authentication │   │
│  │                 │ │                 │ │                 │   │
│  │ • Chat Parser   │ │ • Rate Limiting │ │ • NextAuth.js   │   │
│  │ • Rules CRUD    │ │ • CORS          │ │ • JWT Sessions  │   │
│  │ • Webhooks      │ │ • Validation    │ │ • RLS Policies  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Core Business Logic                       │   │
│  │                                                         │   │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │   │
│  │ │ Chat Parser  │ │Chain Router  │ │ Background Jobs  │ │   │
│  │ │             │ │              │ │                  │ │   │
│  │ │ • NLP → JSON │ │ • Route Calc │ │ • BullMQ Queue   │ │   │
│  │ │ • LLM API    │ │ • Fee Est.   │ │ • Cron Schedule  │ │   │
│  │ │ • Validation │ │ • Multi-chain│ │ • Job Workers    │ │   │
│  │ └──────────────┘ └──────────────┘ └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                               │
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│ │ LLM Service  │ │Circle Client │ │ Email Service│ │  Audit  │ │
│ │              │ │              │ │              │ │ Logger  │ │
│ │ • OpenAI     │ │ • Prog.Wallet│ │ • Resend API │ │ • Events│ │
│ │ • Claude     │ │ • CCTP       │ │ • Templates  │ │ • Security│ │
│ │ • Mock LLM   │ │ • Mock API   │ │ • Notifications│ │ • Tracking│ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│ ┌──────────────┐                           ┌──────────────────┐ │
│ │ PostgreSQL   │◄──────── Prisma ORM ─────►│   Redis Queue    │ │
│ │              │                           │                  │ │
│ │ • RLS Enabled│                           │ • Job Queue      │ │
│ │ • Multi-tenant│                          │ • Rate Limiting  │ │
│ │ • ACID Trans. │                          │ • Session Store  │ │
│ │ • Audit Logs  │                          │ • Cache Layer    │ │
│ └──────────────┘                           └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   Circle    │ │   OpenAI    │ │   Resend    │ │ Blockchain  │ │
│ │ Programmable│ │     API     │ │   Email     │ │  Networks   │ │
│ │   Wallets   │ │             │ │   Service   │ │             │ │
│ │             │ │ • GPT-3.5/4 │ │             │ │ • Ethereum  │ │
│ │ • USDC/EURC │ │ • Rule Parse│ │ • SMTP      │ │ • Base      │ │
│ │ • Multi-chain│ │ • NL → JSON │ │ • Templates │ │ • Arbitrum  │ │
│ │ • CCTP      │ │ • Mock Mode │ │ • Delivery  │ │ • Polygon   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
USER INTERACTION FLOW:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│ 1. USER INPUT (Natural Language)                              │
│    "Send $100 USDC to Alice every Friday on cheapest chain"   │
│                            │                                   │
│                            ▼                                   │
│ 2. CHAT PARSER                                                 │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ Frontend → API → LLM Service → Structured JSON          │ │
│    │                                                         │ │
│    │ Input: Natural language string                          │ │
│    │ Output: RuleJSON + RouteQuotes                         │ │
│    └─────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│ 3. ROUTE CALCULATION                                           │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ Chain Router → Fee Estimation → Best Route Selection    │ │
│    │                                                         │ │
│    │ • Ethereum: $5.20 (slow)                              │ │
│    │ • Base: $0.05 ⭐ (recommended)                         │ │
│    │ • Arbitrum: $0.50                                     │ │
│    │ • Polygon: $0.10                                      │ │
│    └─────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│ 4. RULE STORAGE & SCHEDULING                                   │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ Database → Job Queue → Cron Scheduler                   │ │
│    │                                                         │ │
│    │ • Store rule in PostgreSQL                             │ │
│    │ • Schedule execution job                               │ │
│    │ • Set up monitoring                                    │ │
│    └─────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

EXECUTION FLOW:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│ 1. TRIGGER EVENT                                               │
│    • Cron Schedule: "0 8 * * FRI" (Every Friday 8am)         │
│    • Manual Execution: User clicks "Execute Now"              │
│    • Conditional: Market condition met                        │
│                            │                                   │
│                            ▼                                   │
│ 2. JOB PROCESSING                                              │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ BullMQ Queue → Worker → Rule Execution                  │ │
│    │                                                         │ │
│    │ • Fetch rule from database                             │ │
│    │ • Validate user balance                                │ │
│    │ • Calculate optimal route                              │ │
│    └─────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│ 3. CIRCLE API INTEGRATION                                      │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ Create Transfer → Submit to Chain → Monitor Status      │ │
│    │                                                         │ │
│    │ • POST /transfers (Circle API)                         │ │
│    │ • Blockchain transaction                               │ │
│    │ • Webhook confirmation                                 │ │
│    └─────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│ 4. RESULT TRACKING                                             │
│    ┌─────────────────────────────────────────────────────────┐ │
│    │ Update Database → Audit Log → Notify User               │ │
│    │                                                         │ │
│    │ • Execution record with tx hash                        │ │
│    │ • Security audit trail                                │ │
│    │ • Email/push notification                             │ │
│    └─────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 🔒 Security Architecture

```
SECURITY LAYERS:
┌────────────────────────────────────────────────────────────────┐
│                      DEFENSE IN DEPTH                          │
│                                                                │
│ Layer 1: FRONTEND SECURITY                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • NextAuth.js session management                           │ │
│ │ • CSRF protection                                          │ │
│ │ • XSS prevention                                           │ │
│ │ • Input sanitization                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                   │
│ Layer 2: API SECURITY                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Authentication middleware                                │ │
│ │ • Rate limiting                                            │ │
│ │ • Request validation (Zod)                                 │ │
│ │ • API key management                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                   │
│ Layer 3: DATABASE SECURITY                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Row Level Security (RLS)                                 │ │
│ │ • User data isolation                                      │ │
│ │ • Encrypted connections                                    │ │
│ │ • Audit logging                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                   │
│ Layer 4: EXTERNAL SECURITY                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Webhook signature verification                           │ │
│ │ • API key rotation                                         │ │
│ │ • TLS/HTTPS encryption                                     │ │
│ │ • Environment variable security                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

ROW LEVEL SECURITY (RLS) IMPLEMENTATION:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│ USER A                                USER B                    │
│   │                                     │                      │
│   ▼                                     ▼                      │
│ ┌─────────────────┐               ┌─────────────────┐          │
│ │   Session A     │               │   Session B     │          │
│ │  auth.uid() =   │               │  auth.uid() =   │          │
│ │  "user_a_123"   │               │  "user_b_456"   │          │
│ └─────────────────┘               └─────────────────┘          │
│   │                                     │                      │
│   ▼                                     ▼                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                    PostgreSQL RLS                           │ │
│ │                                                             │ │
│ │ Policy: "Users can view their own records"                  │ │
│ │ WHERE auth.uid()::text = user_id                           │ │
│ │                                                             │ │
│ │ User A Query: SELECT * FROM rules                          │ │
│ │ Result: Only rules where user_id = "user_a_123"           │ │
│ │                                                             │ │
│ │ User B Query: SELECT * FROM rules                          │ │
│ │ Result: Only rules where user_id = "user_b_456"           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## 🏭 Deployment Architecture

```
PRODUCTION DEPLOYMENT:
┌────────────────────────────────────────────────────────────────┐
│                         VERCEL PLATFORM                        │
│                                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                    EDGE NETWORK                             │ │
│ │                                                             │ │
│ │  Global CDN • Edge Functions • Static Assets • SSL/TLS    │ │
│ │                                                             │ │
│ │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │ │
│ │  │     US      │ │     EU      │ │       APAC         │   │ │
│ │  │   Region    │ │   Region    │ │      Region        │   │ │
│ │  └─────────────┘ └─────────────┘ └─────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                            │                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                 SERVERLESS FUNCTIONS                        │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │ │
│ │ │   API       │ │    Pages    │ │   Background        │   │ │
│ │ │  Routes     │ │  Components │ │     Jobs*           │   │ │
│ │ │             │ │             │ │                     │   │ │
│ │ │ • Chat      │ │ • Dashboard │ │ • Worker Process    │   │ │
│ │ │ • Rules     │ │ • Auth      │ │ • Cron Jobs         │   │ │
│ │ │ • Webhooks  │ │ • Settings  │ │ • Queue Processing  │   │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    MANAGED SERVICES                            │
│                                                                │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐│
│ │   SUPABASE      │ │    UPSTASH      │ │      RESEND         ││
│ │  PostgreSQL     │ │     Redis       │ │   Email Service     ││
│ │                 │ │                 │ │                     ││
│ │ • Managed DB    │ │ • Job Queue     │ │ • SMTP Delivery     ││
│ │ • Auto Backups  │ │ • Rate Limiting │ │ • Email Templates   ││
│ │ • Monitoring    │ │ • Session Store │ │ • Bounce Handling   ││
│ │ • RLS Enabled   │ │ • Caching       │ │ • Analytics         ││
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘│
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                   EXTERNAL APIS                               │
│                                                                │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐│
│ │     CIRCLE      │ │     OPENAI      │ │    BLOCKCHAIN       ││
│ │ Programmable    │ │      API        │ │     NETWORKS        ││
│ │   Wallets       │ │                 │ │                     ││
│ │                 │ │ • GPT-3.5/4     │ │ • Ethereum          ││
│ │ • USDC/EURC     │ │ • Rule Parsing  │ │ • Base              ││
│ │ • Multi-chain   │ │ • NL Processing │ │ • Arbitrum          ││
│ │ • CCTP Protocol │ │ • Structured    │ │ • Polygon           ││
│ │ • Webhooks      │ │   Output        │ │ • RPC Endpoints     ││
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘│
└────────────────────────────────────────────────────────────────┘

* Background jobs run as separate processes in production
```

This comprehensive visual architecture shows exactly how your Ferrow application is structured from the frontend all the way down to the blockchain networks, with clear data flows and security layers.