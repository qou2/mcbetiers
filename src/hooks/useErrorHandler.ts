
import { useEffect } from 'react';
import { deepSeekService } from '@/services/deepSeekService';

export function useErrorHandler() {
  useEffect(() => {
    // Global error handler - optimized for mobile
    const handleError = (event: ErrorEvent) => {
      try {
        // Only log critical errors on mobile to reduce performance impact
        if (event.message.includes('Script error') || event.message.includes('Network')) {
          return; // Skip non-critical errors
        }
        
        deepSeekService.logError({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      } catch (error) {
        // Silently fail to avoid recursive errors
      }
    };

    // Unhandled promise rejection handler - optimized
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        // Only log if it's a critical rejection
        if (typeof event.reason === 'string' && event.reason.includes('fetch')) {
          return; // Skip network-related rejections
        }
        
        deepSeekService.logError({
          message: 'Unhandled Promise Rejection',
          reason: event.reason
        });
      } catch (error) {
        // Silently fail
      }
    };

    // Throttled page visit logging
    const logPageVisit = () => {
      try {
        // Only log on desktop or when specifically needed
        if (window.innerWidth > 768) {
          deepSeekService.logPageVisit(window.location.pathname);
        }
      } catch (error) {
        // Silently fail
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Debounced page visit logging
    const timeoutId = setTimeout(logPageVisit, 1000);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearTimeout(timeoutId);
    };
  }, []);
}
