// Debug endpoint to help identify 500 error cause
export async function GET() {
  try {
    const debug = {
      status: "debug-success",
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RENDER: !!process.env.RENDER,
        VERCEL: !!process.env.VERCEL,
        has_database_url: !!process.env.DATABASE_URL,
        has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      },
      runtime: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
      }
    };

    return Response.json(debug);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return Response.json({ 
      status: "debug-error", 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack?.substring(0, 1000) : undefined
    }, { status: 500 });
  }
}