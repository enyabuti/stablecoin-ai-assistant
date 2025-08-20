// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Note: hideSourceMaps is handled by Next.js Sentry configuration
  
  // Disable Sentry during development
  enabled: process.env.NODE_ENV === 'production',

  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event (dev mode):', event);
      return null;
    }
    
    // Filter out known non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('ECONNREFUSED')) {
      return null;
    }
    
    return event;
  },

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0',
  
  // Integrations handled by Next.js Sentry plugin
});