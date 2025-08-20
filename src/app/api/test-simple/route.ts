// Minimal API test - no database, no external dependencies
export async function GET() {
  try {
    return Response.json({ 
      status: 'success',
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    return Response.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}