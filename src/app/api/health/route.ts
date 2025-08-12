import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function GET() {
  try {
    const checks = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "unknown",
        redis: "unknown", 
        api: "healthy"
      },
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development"
    };

    // Check database connection
    try {
      await db.$queryRaw`SELECT 1`;
      checks.services.database = "healthy";
    } catch (error) {
      checks.services.database = "unhealthy";
      checks.status = "degraded";
    }

    // Check Redis connection
    try {
      await redis.ping();
      checks.services.redis = "healthy";
    } catch (error) {
      checks.services.redis = "unhealthy"; 
      checks.status = "degraded";
    }

    // Return appropriate status code
    const statusCode = checks.status === "healthy" ? 200 : 503;
    
    return NextResponse.json(checks, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed"
    }, { status: 503 });
  }
}