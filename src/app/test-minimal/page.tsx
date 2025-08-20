// Minimal test page - should always work
export default function TestMinimal() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎉 Render.com Test Success!</h1>
      <p>If you can see this, the deployment is working.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
}