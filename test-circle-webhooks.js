#!/usr/bin/env node

const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = 'mock-secret';

// Helper function to create HMAC signature for webhook
function createWebhookSignature(body, timestamp, secret = WEBHOOK_SECRET) {
  const payload = `${timestamp}.${body}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `v1=${signature}`;
}

// Mock Circle webhook payloads
const mockWebhookPayloads = {
  transferPending: {
    type: "transfers",
    data: {
      id: "transfer_12345",
      type: "transfer",
      status: "pending",
      amount: {
        amount: "50.00",
        currency: "USDC"
      },
      source: {
        id: "wallet_source_123",
        type: "wallet"
      },
      destination: {
        id: "wallet_dest_456",
        type: "wallet",
        address: "0x742d35Cc6634C0532925a3b8D4034DfC037D7d6d"
      },
      fees: [{
        type: "network",
        amount: "0.05",
        currency: "USDC"
      }],
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString()
    },
    subscriptionId: "sub_12345",
    notificationId: "notification_12345",
    version: 1,
    customAttributes: {
      clientId: "ferrow_app",
      ruleId: "rule_test_123",
      executionId: "exec_test_456"
    }
  },

  transferComplete: {
    type: "transfers",
    data: {
      id: "transfer_12345",
      type: "transfer", 
      status: "complete",
      amount: {
        amount: "50.00",
        currency: "USDC"
      },
      source: {
        id: "wallet_source_123",
        type: "wallet"
      },
      destination: {
        id: "wallet_dest_456", 
        type: "wallet",
        address: "0x742d35Cc6634C0532925a3b8D4034DfC037D7d6d"
      },
      fees: [{
        type: "network",
        amount: "0.05",
        currency: "USDC"
      }],
      createDate: new Date(Date.now() - 60000).toISOString(),
      updateDate: new Date().toISOString()
    },
    subscriptionId: "sub_12345",
    notificationId: "notification_67890",
    version: 1,
    customAttributes: {
      clientId: "ferrow_app",
      ruleId: "rule_test_123", 
      executionId: "exec_test_456"
    }
  },

  transferFailed: {
    type: "transfers",
    data: {
      id: "transfer_12345",
      type: "transfer",
      status: "failed",
      amount: {
        amount: "50.00", 
        currency: "USDC"
      },
      source: {
        id: "wallet_source_123",
        type: "wallet"
      },
      destination: {
        id: "wallet_dest_456",
        type: "wallet",
        address: "0x742d35Cc6634C0532925a3b8D4034DfC037D7d6d"
      },
      fees: [{
        type: "network",
        amount: "0.05",
        currency: "USDC"
      }],
      createDate: new Date(Date.now() - 120000).toISOString(),
      updateDate: new Date().toISOString()
    },
    subscriptionId: "sub_12345",
    notificationId: "notification_11111",
    version: 1,
    customAttributes: {
      clientId: "ferrow_app",
      ruleId: "rule_test_123",
      executionId: "exec_test_456"
    }
  }
};

// Function to send webhook
async function sendWebhook(payloadKey, description) {
  const payload = mockWebhookPayloads[payloadKey];
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createWebhookSignature(body, timestamp);
  
  console.log(`\n🔄 Testing: ${description}`);
  console.log(`📤 Sending webhook: ${payloadKey}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/circle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'circle-signature': signature,
        'circle-timestamp': timestamp
      },
      body: body
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Webhook processed successfully:`, result);
    } else {
      console.log(`❌ Webhook failed:`, result);
    }
    
    return { success: response.ok, result };
  } catch (error) {
    console.error(`❌ Error sending webhook:`, error.message);
    return { success: false, error: error.message };
  }
}

// Function to test API endpoints
async function testApiEndpoint(endpoint, method = 'GET', body = null, description = '') {
  console.log(`\n🔄 Testing API: ${description || endpoint}`);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ API call successful:`, result);
    } else {
      console.log(`❌ API call failed:`, result);
    }
    
    return { success: response.ok, result, status: response.status };
  } catch (error) {
    console.error(`❌ Error calling API:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting Ferrow App Tests');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('=' .repeat(50));

  // Test 1: Health Check
  await testApiEndpoint('/api/health', 'GET', null, 'Health Check');

  // Test 2: Feature Flags
  await testApiEndpoint('/api/feature-flags', 'GET', null, 'Feature Flags');

  // Test 3: Webhook Health Check
  await testApiEndpoint('/api/webhooks/circle', 'GET', null, 'Webhook Health Check');

  // Test 4: Rule Parsing
  await testApiEndpoint('/api/chat/parse', 'POST', {
    message: "Send $50 USDC to John every Friday at 8am"
  }, 'Rule Parsing');

  // Test 5: Route Quote
  await testApiEndpoint('/api/rules/route-quote', 'POST', {
    ruleJSON: {
      type: "schedule",
      asset: "USDC", 
      amount: "50.00",
      destination: "0x742d35Cc6634C0532925a3b8D4034DfC037D7d6d",
      schedule: {
        frequency: "weekly",
        dayOfWeek: 5,
        tz: "UTC"
      },
      routing: {
        mode: "cheapest",
        allowedChains: ["base", "arbitrum", "polygon"]
      }
    }
  }, 'Route Quote Generation');

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Testing Circle Webhooks');
  console.log('=' .repeat(50));

  // Test 6: Circle Webhooks
  await sendWebhook('transferPending', 'Transfer Pending Webhook');
  await sendWebhook('transferComplete', 'Transfer Complete Webhook');
  await sendWebhook('transferFailed', 'Transfer Failed Webhook');

  // Test 7: Invalid Signature (should fail)
  console.log(`\n🔄 Testing: Invalid Signature (should fail)`);
  const invalidPayload = JSON.stringify(mockWebhookPayloads.transferComplete);
  const invalidTimestamp = Math.floor(Date.now() / 1000).toString();
  const invalidSignature = 'v1=invalid_signature';
  
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/circle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'circle-signature': invalidSignature,
        'circle-timestamp': invalidTimestamp
      },
      body: invalidPayload
    });

    const result = await response.json();
    
    if (response.status === 401) {
      console.log(`✅ Invalid signature correctly rejected:`, result);
    } else {
      console.log(`❌ Invalid signature should have been rejected:`, result);
    }
  } catch (error) {
    console.error(`❌ Error testing invalid signature:`, error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Testing Execute Rule Flow');
  console.log('=' .repeat(50));

  // Test 8: Execute Rule
  await testApiEndpoint('/api/rules/execute-now', 'POST', {
    ruleId: "test_rule_123"
  }, 'Execute Rule Now');

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Testing Complete!');
  console.log('=' .repeat(50));
  console.log('\n📋 Manual Testing Checklist:');
  console.log('1. ✅ Visit the app in browser');
  console.log('2. ✅ Test the golden flow: Chat → RuleJSON → Quote → Confirm → Receipt');
  console.log('3. ✅ Try navigation between pages');
  console.log('4. ✅ Test mobile responsive design');
  console.log('5. ✅ Check browser console for errors');
  console.log('6. ✅ Test feature flag toggles');
  console.log('\n🔗 App URLs:');
  console.log(`   • Production: https://stablecoin-eut0k0yga-enyabutis-projects.vercel.app`);
  console.log(`   • Local Dev: http://localhost:3000`);
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'webhook-only') {
  console.log('🎯 Testing Circle Webhooks Only');
  console.log('=' .repeat(50));
  
  (async () => {
    await sendWebhook('transferPending', 'Transfer Pending Webhook');
    await sendWebhook('transferComplete', 'Transfer Complete Webhook'); 
    await sendWebhook('transferFailed', 'Transfer Failed Webhook');
  })();
} else if (command === 'api-only') {
  console.log('🎯 Testing API Endpoints Only');
  console.log('=' .repeat(50));
  
  (async () => {
    await testApiEndpoint('/api/health', 'GET', null, 'Health Check');
    await testApiEndpoint('/api/feature-flags', 'GET', null, 'Feature Flags');
    await testApiEndpoint('/api/webhooks/circle', 'GET', null, 'Webhook Health');
  })();
} else {
  // Run all tests
  runTests();
}

// Export for potential module usage
module.exports = {
  sendWebhook,
  testApiEndpoint,
  mockWebhookPayloads,
  createWebhookSignature
};