import { beforeEach, afterEach } from '@playwright/test';

// Mock Next.js router for component testing
export const mockNextRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock providers for testing  
export const TestProviders = ({ children }: { children: any }) => {
  return `<div data-testid="test-provider">${children}</div>`;
};

// Test setup utilities
export const setupComponentTest = () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });
};

// Common test data
export const testData = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
  },
  rule: {
    id: 'test-rule-1',
    name: 'Test Rule',
    status: 'active',
    description: 'A test rule for automation',
  },
  transfer: {
    id: 'test-transfer-1',
    amount: '1000',
    fromChain: 'ethereum',
    toChain: 'polygon',
    status: 'completed',
  },
};

// Mock API responses
export const mockApiResponses = {
  success: {
    rules: [testData.rule],
    transfers: [testData.transfer],
    user: testData.user,
  },
  error: {
    message: 'Something went wrong',
    code: 'TEST_ERROR',
  },
};