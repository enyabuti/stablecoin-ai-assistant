import crypto from 'crypto';

const MAX_TIMESTAMP_SKEW = 5 * 60 * 1000; // 5 minutes in milliseconds

export function verifyHmac(
  body: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  try {
    // Check timestamp skew
    const timestampMs = parseInt(timestamp) * 1000;
    const now = Date.now();
    const skew = Math.abs(now - timestampMs);
    
    if (skew > MAX_TIMESTAMP_SKEW) {
      console.warn('Webhook timestamp too old:', { skew, maxSkew: MAX_TIMESTAMP_SKEW });
      return false;
    }

    // Compute expected signature
    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Extract signature from header (format: "v1=<signature>")
    const receivedSignature = signature.replace('v1=', '');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

export function createMockWebhookSignature(
  body: string,
  timestamp: string,
  secret: string = 'mock-secret'
): string {
  const payload = `${timestamp}.${body}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `v1=${signature}`;
}