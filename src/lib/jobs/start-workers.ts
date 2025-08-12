#!/usr/bin/env tsx

import { startWorkers } from './worker';
import { cronScheduler } from './cron';
import { addConditionCheckJob } from './queue';

async function main() {
  console.log('🚀 Starting Stablecoin AI job workers...');
  
  // Start background workers
  const workers = startWorkers();
  
  // Start cron scheduler
  cronScheduler.start();
  
  // Schedule initial condition check
  await addConditionCheckJob();
  
  console.log('✅ All workers started successfully!');
  console.log('📊 Workers: Rule execution, Condition checking');
  console.log('⏰ Scheduler: Cron-based rule scheduling');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down workers...');
    
    cronScheduler.stop();
    workers.executeRuleWorker.close();
    workers.conditionCheckWorker.close();
    
    console.log('✅ Workers shut down gracefully');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down workers...');
    
    cronScheduler.stop();
    workers.executeRuleWorker.close();
    workers.conditionCheckWorker.close();
    
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start workers:', error);
  process.exit(1);
});