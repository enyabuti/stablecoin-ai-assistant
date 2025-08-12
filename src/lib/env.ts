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
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(issue => issue.code === "invalid_type" && issue.received === "undefined")
        .map(issue => issue.path.join("."));
      
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env.local file."
      );
    }
    throw error;
  }
}

export const env = getEnv();