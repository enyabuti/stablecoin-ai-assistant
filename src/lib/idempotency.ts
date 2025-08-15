// In-memory storage for demo (would be database in production)
const idempotencyStore = new Map<string, string>();

export async function withIdempotency(
  req: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const key = req.headers.get('Idempotency-Key');
  
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'Missing Idempotency-Key header' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Check if we've seen this key before
  const cachedResponse = idempotencyStore.get(key);
  if (cachedResponse) {
    return new Response(cachedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotent': 'true'
      }
    });
  }

  // Execute the handler
  const response = await handler();
  const responseText = await response.clone().text();

  // Store the response for future requests with the same key
  idempotencyStore.set(key, responseText);

  return response;
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}