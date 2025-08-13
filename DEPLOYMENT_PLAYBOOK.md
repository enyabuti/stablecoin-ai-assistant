# 🚀 Next.js Production Deployment Playbook

## 📋 **Lessons Learned from Stablecoin-AI Deployment**

This playbook documents all the steps, corrections, and best practices learned during the successful deployment of the stablecoin-ai application. Follow this guide to minimize corrections and achieve smooth deployments.

---

## 🎯 **Core Principles for Smooth Deployments**

### **1. Build-First Development**
- **Always design for build-time safety** from the start
- **Never access external services during static generation**
- **Use environment detection** (`process.env.VERCEL`, `NEXT_PHASE`) early

### **2. Graceful Degradation by Design**
- **Implement fallbacks for every external service**
- **Design APIs to work without database/Redis from day one**
- **Create health monitoring as a core feature, not an afterthought**

### **3. Environment Management**
- **Use permissive validation during builds**
- **Separate build-time vs runtime requirements**
- **Always provide fallback values for missing environment variables**

---

## 📝 **Step-by-Step Deployment Guide**

### **Phase 1: Project Setup (Do This First)**

#### **1.1 Environment Configuration**
```typescript
// src/lib/env.ts - CORRECT PATTERN from start
function getEnv() {
  // CRITICAL: Always check for build/deployment environment first
  if (process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder",
      REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-placeholder",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      // ... other vars with fallbacks
    };
  }
  
  // Only do strict validation in local/runtime environments
  return envSchema.parse(process.env);
}
```

#### **1.2 Database Setup with Build Safety**
```typescript
// src/lib/db.ts - CORRECT PATTERN from start
let prismaClient: PrismaClient | null = null;

try {
  // Only initialize Prisma if we have a real database URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: { db: { url: process.env.DATABASE_URL } }
    });
  }
} catch (error) {
  console.warn('Prisma initialization failed - using fallback mode');
  prismaClient = null;
}

export const db = prismaClient as any; // Type assertion for build compatibility
```

#### **1.3 Queue System with Fallbacks**
```typescript
// src/lib/jobs/queue.ts - CORRECT PATTERN from start
let connection: IORedis | null = null;
let isRedisAvailable = false;

// CRITICAL: Skip Redis during build
if (process.env.NEXT_PHASE !== 'phase-production-build' && 
    !process.env.REDIS_URL?.includes('localhost')) {
  try {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    // ... event handlers
  } catch (error) {
    console.warn('Redis initialization failed');
  }
}

// Always provide fallback execution
export async function addExecuteRuleJob(data: ExecuteRuleJob) {
  if (executeRuleQueue && isRedisAvailable) {
    try {
      return await executeRuleQueue.add("execute-rule", data);
    } catch (error) {
      isRedisAvailable = false;
    }
  }
  
  // CRITICAL: Always have immediate execution fallback
  const { processExecuteRuleJob } = await import('@/lib/jobs/worker');
  await processExecuteRuleJob(data);
  return { id: data.idempotencyKey, data };
}
```

### **Phase 2: API Routes with Graceful Degradation**

#### **2.1 Health Endpoint Pattern**
```typescript
// src/app/api/health/route.ts - IMPLEMENT FIRST
export async function GET() {
  // CRITICAL: Skip checks during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      status: "build-time",
      services: { database: "build-skipped", redis: "build-skipped" }
    });
  }

  const checks = { status: "healthy", services: {} };
  
  // Always wrap service checks in try/catch
  try {
    await db.$queryRaw`SELECT 1`;
    checks.services.database = "healthy";
  } catch {
    checks.services.database = "unhealthy";
    checks.status = "degraded";
  }
  
  return NextResponse.json(checks);
}
```

#### **2.2 API Route Pattern with Service Checks**
```typescript
// Pattern for all API routes
export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Always check service availability first
    if (!isDatabaseConnected()) {
      return NextResponse.json(
        { error: "Service temporarily unavailable", fallback: true },
        { status: 503 }
      );
    }
    
    // Use safe database operations with fallbacks
    const result = await safeDbOperation(
      () => db.table.findUnique({ where: { id } }),
      null,
      'operation description'
    );
    
    if (result === null) {
      return NextResponse.json(
        { error: "Service degraded", fallback: true },
        { status: 503 }
      );
    }
    
    // Your business logic here...
    
  } catch (error) {
    return NextResponse.json(
      { error: "Operation failed", details: error.message },
      { status: 500 }
    );
  }
}
```

### **Phase 3: Production Configuration**

#### **3.1 Next.js Configuration**
```javascript
// next.config.js - CORRECT from start
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bullmq"]
  },
  // Add Vercel-specific optimizations
  ...(process.env.VERCEL && {
    generateBuildId: async () => 'vercel-build'
  })
};
```

#### **3.2 Package.json Scripts**
```json
{
  "scripts": {
    "build": "NEXT_PHASE=phase-production-build next build",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:workers\"",
    "type-check": "tsc --noEmit"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### **3.3 Prisma Schema for Production**
```prisma
// prisma/schema.prisma - Include from start
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // CRITICAL for Supabase
}
```

### **Phase 4: Deployment Process**

#### **4.1 Environment Variables Setup (Vercel)**
```bash
# Set these BEFORE first deployment
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add REDIS_URL production
```

#### **4.2 Database Setup**
```bash
# Use environment-aware commands
npm run db:generate
npm run db:push  # Only with proper DATABASE_URL
```

#### **4.3 Deployment**
```bash
# Test build locally first
npm run build

# Deploy to Vercel
npx vercel --prod
```

---

## ❌ **Common Mistakes to Avoid**

### **Environment & Build Issues**
1. **❌ NEVER**: Access external services during static generation
2. **❌ NEVER**: Use strict environment validation during builds
3. **❌ NEVER**: Initialize databases/Redis without fallback handling
4. **❌ NEVER**: Assume services are available during build

### **Database & Services**
1. **❌ NEVER**: Make database calls without try/catch wrappers
2. **❌ NEVER**: Initialize Prisma without checking environment
3. **❌ NEVER**: Forget to include `directUrl` for Supabase
4. **❌ NEVER**: Skip graceful degradation for external services

### **API Design**
1. **❌ NEVER**: Return generic 500 errors without context
2. **❌ NEVER**: Fail completely when one service is down
3. **❌ NEVER**: Skip service availability checks in API routes
4. **❌ NEVER**: Forget to implement health monitoring

---

## ✅ **Must-Have Patterns**

### **1. Service Availability Detection**
```typescript
export function isDatabaseConnected(): boolean {
  return prismaClient !== null && isDatabaseHealthy;
}

export function isQueueHealthy(): boolean {
  return isRedisAvailable && connection !== null;
}
```

### **2. Safe Operation Wrapper**
```typescript
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
  operationName = 'database operation'
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.warn(`${operationName} failed:`, error);
    return fallbackValue !== undefined ? fallbackValue : null;
  }
}
```

### **3. Build-Safe Component Pattern**
```typescript
// For any component that might access services
if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
  return <div>Building...</div>;
}
```

---

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Environment variables support build-time fallbacks
- [ ] Database client has null-safe initialization
- [ ] Redis/Queue system has immediate execution fallback
- [ ] Health endpoint implemented and working
- [ ] All API routes have service availability checks
- [ ] Build passes locally with `npm run build`
- [ ] Type checking passes with `npm run type-check`

### **Production Setup**
- [ ] Database URL configured (Supabase with directUrl)
- [ ] Redis URL configured (even if fallback)
- [ ] NextAuth secret generated and set
- [ ] Environment variables set in Vercel
- [ ] Domain and SSL configured

### **Post-Deployment**
- [ ] Health endpoint returns 200
- [ ] API routes respond correctly
- [ ] Database connections work
- [ ] Graceful degradation tested
- [ ] Error handling verified

---

## 🎯 **Success Metrics**

1. **First Deployment Success Rate**: Aim for 90%+ success on first try
2. **Build Time**: Under 3 minutes for typical Next.js app
3. **Zero Service Failures**: Application works even when Redis/DB degraded
4. **Error Recovery**: MTTR (Mean Time To Recovery) under 1 minute

---

## 📚 **Reference Architecture**

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   Vercel CDN    │───▶│  Next.js App │───▶│  Supabase   │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Redis Queue │
                       │  (Fallback)  │
                       └──────────────┘
```

**Key Principles:**
- Every service has a fallback
- Build process is isolated from runtime services
- Health monitoring is built-in
- Graceful degradation is the default

---

This playbook should enable smooth deployments with minimal corrections. The key is implementing these patterns from the start rather than retrofitting them later.