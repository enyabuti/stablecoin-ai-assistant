// Ultra-minimal startup test
export async function GET() {
  return Response.json({ 
    status: 'server-running',
    message: 'Basic server startup successful',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
}