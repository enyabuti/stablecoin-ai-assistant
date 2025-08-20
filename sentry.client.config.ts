// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for Sessions
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for Errors  
  replaysOnErrorSampleRate: 1.0,

  // Note: hideSourceMaps is handled by Next.js Sentry configuration

  // Disable Sentry during development
  enabled: process.env.NODE_ENV === 'production',

  beforeSend(event) {
    // Filter out known non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    
    if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
      return null;
    }
    
    return event;
  },

  // Replay integration handled by Next.js Sentry plugin

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0',
});