import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Database connection status
let isDatabaseHealthy = true;
let lastConnectionError: Error | null = null;

// Create Prisma client with better error handling
let prismaClient: PrismaClient | null = null;

try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
} catch (error) {
  console.warn('Failed to initialize Prisma client:', error);
  // Create a mock client for build time
  prismaClient = null;
}

// If prismaClient is null, we'll just re-export it and let runtime handle the errors
export const db = prismaClient as any;

if (process.env.NODE_ENV !== "production" && prismaClient) globalForPrisma.prisma = prismaClient;

// Monitor connection health
async function checkDatabaseHealth() {
  // Skip database health checks during build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.warn('Skipping database health check during build');
    isDatabaseHealthy = false;
    return false;
  }

  try {
    await db.$queryRaw`SELECT 1`;
    isDatabaseHealthy = true;
    lastConnectionError = null;
    return true;
  } catch (error) {
    isDatabaseHealthy = false;
    lastConnectionError = error instanceof Error ? error : new Error('Database connection failed');
    console.warn('Database health check failed:', error);
    return false;
  }
}

// Wrapper for database operations with graceful fallback
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
  operationName = 'database operation'
): Promise<T | null> {
  try {
    const result = await operation();
    isDatabaseHealthy = true;
    lastConnectionError = null;
    return result;
  } catch (error) {
    isDatabaseHealthy = false;
    lastConnectionError = error instanceof Error ? error : new Error(`${operationName} failed`);
    console.warn(`${operationName} failed, using fallback:`, error);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    return null;
  }
}

// Health check functions
export function isDatabaseConnected() {
  return isDatabaseHealthy;
}

export function getLastDatabaseError() {
  return lastConnectionError;
}

export async function testDatabaseConnection() {
  return await checkDatabaseHealth();
}

// Graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    try {
      if (prismaClient) await prismaClient.$disconnect();
    } catch (error) {
      console.warn('Error during database disconnect:', error);
    }
  });
  
  // Periodic health check only if we have a real client
  if (prismaClient) {
    setInterval(checkDatabaseHealth, 30000); // Check every 30 seconds
  }
}