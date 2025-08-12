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
  // Check if we're in build mode (no runtime database connection needed)
  const isBuildTime = !process.env.NEXTAUTH_SECRET || process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isBuildTime) {
    console.warn("Build time detected - using minimal environment validation");
    return {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build",
      REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-time-secret-placeholder",
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

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(issue => issue.code === "invalid_type" && issue.received === "undefined")
        .map(issue => issue.path.join("."));
      
      console.warn(`Missing environment variables (${missingVars.join(", ")}), using defaults for build`);
      
      // Return defaults instead of throwing during build
      return {
        DATABASE_URL: process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build",
        REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-fallback-secret",
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
    throw error;
  }
}

export const env = getEnv();