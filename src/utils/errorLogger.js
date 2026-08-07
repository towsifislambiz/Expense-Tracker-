/**
 * Global Error Logger & Monitoring Service
 */
export const logError = (error, context = {}) => {
  const errorPayload = {
    error: error?.message || String(error),
    stack: error?.stack || null,
    userId: context.userId || 'anonymous',
    route: window.location.pathname || '/',
    timestamp: new Date().toISOString(),
    severity: context.severity || 'error', // 'info' | 'warning' | 'error' | 'fatal'
    environment: import.meta.env.MODE || 'production',
  };

  if (import.meta.env.DEV) {
    console.error('[ErrorLogger]', errorPayload);
  } else {
    // In production, log to console safely or send to logging service
    console.error(`[ProdError] ${errorPayload.timestamp} - ${errorPayload.error}`);
  }

  return errorPayload;
};

// Global unhandled promise rejection listener
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { severity: 'fatal', context: 'unhandledrejection' });
  });
}
