#!/usr/bin/env tsx

import { startWorkers } from './worker';
import { cronScheduler } from './cron';
import { conditionChecker } from './conditionChecker';
import { addConditionCheckJob } from './queue';

async function main() {
  console.log('🚀 Starting Ferrow job workers and schedulers...');
  
  // Initialize condition checker with initial FX rates
  console.log('📊 Initializing condition monitoring system...');
  await conditionChecker.refreshRates();
  
  // Start background workers
  const workers = startWorkers();
  
  // Start cron scheduler
  console.log('⏰ Starting cron scheduler...');
  cronScheduler.start();
  
  // Schedule initial condition check and set up periodic monitoring
  console.log('🎯 Setting up condition monitoring...');
  await addConditionCheckJob();
  
  // Start periodic FX rate updates (every 2 minutes)
  const fxUpdateInterval = setInterval(async () => {
    try {
      await conditionChecker.refreshRates();
    } catch (error) {
      console.error('Error updating FX rates:', error);
    }
  }, 2 * 60 * 1000);
  
  console.log('✅ All systems operational!');
  console.log('🔧 Components active:');
  console.log('  📊 Workers: Rule execution, Enhanced condition checking');
  console.log('  ⏰ Scheduler: Cron-based rule scheduling with statistics');
  console.log('  💱 FX Oracle: Mock rates with realistic volatility');
  console.log('  🎯 Condition Monitor: Sophisticated triggering with duplicate prevention');
  
  // Enhanced graceful shutdown
  const gracefulShutdown = () => {
    console.log('\n🛑 Initiating graceful shutdown...');
    
    // Clear intervals
    clearInterval(fxUpdateInterval);
    
    // Stop schedulers and workers
    cronScheduler.stop();
    if (workers.executeRuleWorker) {
      workers.executeRuleWorker.close();
    }
    if (workers.conditionCheckWorker) {
      workers.conditionCheckWorker.close();
    }
    
    console.log('✅ All systems shut down gracefully');
    process.exit(0);
  };
  
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  
  // Log system status every 5 minutes
  setInterval(() => {
    const cronStatus = cronScheduler.getStatus();
    const conditionStates = conditionChecker.getConditionStates();
    const fxRates = conditionChecker.getFxRates();
    
    console.log('📈 System Status:');
    console.log(`  ⏰ Cron: ${cronStatus.running ? 'Running' : 'Stopped'} (${cronStatus.stats.rulesChecked} rules checked last run)`);
    console.log(`  🎯 Conditions: ${conditionStates.size} monitored`);
    console.log(`  💱 FX Rates: ${fxRates.size} pairs tracked`);
  }, 5 * 60 * 1000);
}

main().catch((error) => {
  console.error('❌ Failed to start workers:', error);
  process.exit(1);
});