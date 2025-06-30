
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageVisit } from '@/services/analyticsService';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Debounced and mobile-optimized page tracking
    const trackVisit = () => {
      try {
        // Reduce analytics calls on mobile for better performance
        if (window.innerWidth <= 768) {
          // Only track major route changes on mobile
          if (location.pathname === '/' || location.pathname.includes('/admin')) {
            trackPageVisit(location.pathname);
          }
        } else {
          trackPageVisit(location.pathname);
        }
      } catch (error) {
        // Silently fail to avoid breaking the app
      }
    };

    // Debounce the tracking call
    const timeoutId = setTimeout(trackVisit, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  useEffect(() => {
    // Track initial page load with delay
    const trackInitial = () => {
      try {
        if (window.innerWidth > 768) {
          trackPageVisit(window.location.pathname);
        }
      } catch (error) {
        // Silently fail
      }
    };

    const timeoutId = setTimeout(trackInitial, 1000);
    return () => clearTimeout(timeoutId);
  }, []);
}
