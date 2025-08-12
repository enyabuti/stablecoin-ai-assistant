import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export interface ExecuteRuleJob {
  ruleId: string;
  userId: string;
  idempotencyKey: string;
  triggeredBy: "schedule" | "condition" | "manual";
}

export interface CheckConditionsJob {
  timestamp: string;
}

// Job queues
export const executeRuleQueue = new Queue<ExecuteRuleJob>("execute-rule", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const conditionCheckQueue = new Queue<CheckConditionsJob>("condition-check", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
  },
});

// Helper functions
export async function addExecuteRuleJob(data: ExecuteRuleJob) {
  return await executeRuleQueue.add("execute-rule", data, {
    jobId: data.idempotencyKey, // Prevent duplicates
  });
}

export async function addConditionCheckJob() {
  return await conditionCheckQueue.add("condition-check", {
    timestamp: new Date().toISOString(),
  }, {
    repeat: {
      pattern: "*/5 * * * *", // Every 5 minutes
    },
  });
}

export { connection };