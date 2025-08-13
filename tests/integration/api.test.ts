import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure server is running
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Health Checks', () => {
    it('should respond to health check', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      expect(response.status).toBe(200);
    });

    it('should respond to deployment check', async () => {
      const response = await fetch(`${BASE_URL}/api/deployment-check`);
      expect(response.status).toBe(200);
    });
  });

  describe('MCP Integration', () => {
    it('should return MCP service status', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp/chat`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('active');
      expect(data.services).toBeDefined();
      expect(data.services.sequential).toBeDefined();
      expect(data.services.magicUI).toBeDefined();
    });

    it('should process MCP chat request', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Send $100 USDC to Alice when ETH rises above $2500'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.actions).toBeDefined();
    });

    it('should generate UI components', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp/ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Generate a simple button component',
          type: 'component'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.component).toBeDefined();
      expect(data.component.code).toBeDefined();
      expect(data.component.language).toBe('tsx');
    });
  });

  describe('Authentication API', () => {
    it('should handle NextAuth endpoints', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/providers`);
      expect(response.status).toBe(200);
      
      const providers = await response.json();
      expect(providers.email).toBeDefined();
    });
  });

  describe('Chat Parse API', () => {
    it('should parse rule creation requests', async () => {
      const response = await fetch(`${BASE_URL}/api/chat/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Send $50 USDC to john@example.com every Friday'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.rule || data.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid MCP requests', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle invalid UI generation requests', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp/ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});