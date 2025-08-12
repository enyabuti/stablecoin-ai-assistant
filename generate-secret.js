#!/usr/bin/env node

// Generate a secure random secret for NEXTAUTH_SECRET
const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('🔐 Generated NEXTAUTH_SECRET:');
console.log(generateSecret());
console.log('');
console.log('📋 Copy this value and use it as your NEXTAUTH_SECRET environment variable');