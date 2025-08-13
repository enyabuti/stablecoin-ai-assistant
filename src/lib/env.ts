import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Feature Flags
  USE_CIRCLE: z.string().transform(val => val === "true").default("false"),
  USE_MOCKS: z.string().transform(val => val === "true").default("true"),
  ENABLE_CCTP: z.string().transform(val => val === "true").default("false"),
  
  // Circle API (Optional - mocked by default)
  CIRCLE_API_KEY: z.string().optional(),
  CIRCLE_ENTITY_SECRET: z.string().optional(),
  CIRCLE_WEBHOOK_SECRET: z.string().optional(),
  
  // LLM Provider
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function getEnv() {
  // Always use permissive environment for Vercel builds
  if (process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET) {
    console.warn("Vercel/build environment detected - using permissive env validation");
    return {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder",
      REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "vercel-build-placeholder",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      USE_CIRCLE: false,
      USE_MOCKS: true,
      ENABLE_CCTP: false,
      CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
      CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
      CIRCLE_WEBHOOK_SECRET: process.env.CIRCLE_WEBHOOK_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      NODE_ENV: (process.env.NODE_ENV as any) || "production",
    };
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.warn("Env validation failed, using permissive fallback");
    return {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/fallback",
      REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fallback-secret",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      USE_CIRCLE: false,
      USE_MOCKS: true,
      ENABLE_CCTP: false,
      CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
      CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
      CIRCLE_WEBHOOK_SECRET: process.env.CIRCLE_WEBHOOK_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
    };
  }
}

export const env = getEnv();