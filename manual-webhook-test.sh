#!/bin/bash

echo "🎯 Manual Circle Webhook Test"
echo "============================="
echo ""

# Test webhook endpoint directly
echo "Testing webhook endpoint health..."
curl -s http://localhost:3000/api/webhooks/circle | jq '.'

echo ""
echo "Sending mock Circle transfer webhook..."

# Create a simple webhook payload
TIMESTAMP=$(date +%s)
PAYLOAD='{"type":"transfers","data":{"id":"test_123","type":"transfer","status":"complete","amount":{"amount":"50.00","currency":"USDC"},"createDate":"'$(date -Iseconds)'","updateDate":"'$(date -Iseconds)'"},"subscriptionId":"sub_123","notificationId":"notif_123","version":1,"customAttributes":{"ruleId":"test_rule","executionId":"test_exec"}}'

# Calculate HMAC signature (simplified for demo)
SIGNATURE="v1=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "mock-secret" | cut -d' ' -f2)"

echo "Payload: $PAYLOAD"
echo "Signature: $SIGNATURE"
echo ""

# Send the webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -H "circle-signature: $SIGNATURE" \
  -H "circle-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD" \
  http://localhost:3000/api/webhooks/circle | jq '.'

echo ""
echo "✅ Manual webhook test complete!"