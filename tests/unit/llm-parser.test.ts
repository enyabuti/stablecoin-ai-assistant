import { describe, it, expect } from 'vitest';
import { MockLLMProvider } from '@/lib/llm/parser';
import { RuleJSONSchema } from '@/lib/llm/schema';

describe('LLM Parser', () => {
  const parser = new MockLLMProvider();

  it('should parse scheduled transfer correctly', async () => {
    const input = 'Send $50 USDC to John every Friday at 8am';
    const result = await parser.parseRule(input);
    
    expect('error' in result).toBe(false);
    
    if (!('error' in result)) {
      expect(result.type).toBe('schedule');
      expect(result.asset).toBe('USDC');
      expect(result.amount.value).toBe(50);
      expect(result.destination.value).toBe('John');
      expect(result.routing.mode).toBe('cheapest');
    }
  });

  it('should parse conditional transfer correctly', async () => {
    const input = 'Send €200 to 0x1234567890123456789012345678901234567890 when EUR rises 2%';
    const result = await parser.parseRule(input);
    
    expect('error' in result).toBe(false);
    
    if (!('error' in result)) {
      expect(result.type).toBe('conditional');
      expect(result.asset).toBe('EURC');
      expect(result.amount.value).toBe(200);
      expect(result.destination.type).toBe('address');
    }
  });

  it('should return error for invalid input', async () => {
    const input = 'This is not a valid rule';
    const result = await parser.parseRule(input);
    
    expect('error' in result).toBe(true);
  });

  it('should validate parsed rules against schema', async () => {
    const input = 'Send $50 USDC to John every Friday at 8am';
    const result = await parser.parseRule(input);
    
    if (!('error' in result)) {
      expect(() => RuleJSONSchema.parse(result)).not.toThrow();
    }
  });
});