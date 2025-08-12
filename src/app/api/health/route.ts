import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Skip service checks during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({
        status: "build-time",
        timestamp: new Date().toISOString(),
        services: {
          database: "build-skipped",
          redis: "build-skipped", 
          queue: "build-skipped",
          api: "healthy"
        },
        version: process.env.npm_package_version || "unknown",
        environment: process.env.NODE_ENV || "development"
      });
    }

    const checks = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "unknown",
        redis: "unknown", 
        queue: "unknown",
        api: "healthy"
      },
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development"
    };

    // Check database connection with timeout and error handling
    try {
      const { db } = await import("@/lib/db");
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      );
      
      await Promise.race([
        db.$queryRaw`SELECT 1`,
        timeout
      ]);
      checks.services.database = "healthy";
    } catch (error) {
      console.warn("Database health check failed:", error);
      checks.services.database = "unhealthy";
      checks.status = "degraded";
    }

    // Check Redis connection with timeout and error handling
    try {
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        connectTimeout: 3000,
        lazyConnect: true,
        maxRetriesPerRequest: 1
      });
      
      await redis.ping();
      await redis.disconnect();
      checks.services.redis = "healthy";
    } catch (error) {
      console.warn("Redis health check failed:", error);
      checks.services.redis = "unhealthy"; 
      checks.status = "degraded";
    }

    // Check queue system status
    try {
      const { isQueueHealthy, getQueueStatus } = await import("@/lib/jobs/queue");
      const queueStatus = getQueueStatus();
      
      if (isQueueHealthy()) {
        checks.services.queue = "healthy";
      } else if (queueStatus.fallbackMode) {
        checks.services.queue = "degraded";
        checks.status = "degraded";
      } else {
        checks.services.queue = "unhealthy";
        checks.status = "degraded";
      }
    } catch (error) {
      console.warn("Queue health check failed:", error);
      checks.services.queue = "unhealthy";
      checks.status = "degraded";
    }

    // Return appropriate status code
    const statusCode = checks.status === "healthy" ? 200 : 503;
    
    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 503 });
  }
}