import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Database connection status
let isDatabaseHealthy = true;
let lastConnectionError: Error | null = null;

// Create Prisma client with better error handling
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  errorFormat: "pretty",
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Monitor connection health
async function checkDatabaseHealth() {
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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    try {
      await db.$disconnect();
    } catch (error) {
      console.warn('Error during database disconnect:', error);
    }
  });
  
  // Periodic health check
  setInterval(checkDatabaseHealth, 30000); // Check every 30 seconds
}