
import { useState, useEffect } from 'react';

const WELCOME_POPUP_KEY = 'mcbe_tiers_welcome_shown';
const VISITOR_COUNT_KEY = 'mcbe_tiers_visitor_count';
const GLOBAL_VISITOR_COUNT_KEY = 'mcbe_tiers_global_visitors';

export const useWelcomePopup = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [visitorNumber, setVisitorNumber] = useState(1);

  useEffect(() => {
    // Check if welcome popup has been shown before
    const hasShownWelcome = localStorage.getItem(WELCOME_POPUP_KEY);
    
    if (!hasShownWelcome) {
      // Get or generate visitor number
      let currentVisitorNumber = localStorage.getItem(VISITOR_COUNT_KEY);
      
      if (!currentVisitorNumber) {
        // Get global visitor count and increment it
        let globalCount = parseInt(localStorage.getItem(GLOBAL_VISITOR_COUNT_KEY) || '0');
        
        // If this is the first visitor ever, start from a realistic number
        if (globalCount === 0) {
          globalCount = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;
        } else {
          globalCount += 1;
        }
        
        // Store the new global count
        localStorage.setItem(GLOBAL_VISITOR_COUNT_KEY, globalCount.toString());
        
        // Set this user's visitor number
        currentVisitorNumber = globalCount.toString();
        localStorage.setItem(VISITOR_COUNT_KEY, currentVisitorNumber);
      }
      
      setVisitorNumber(parseInt(currentVisitorNumber));
      
      // Show welcome popup after a brief delay for smooth loading
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    // Mark as shown so it never appears again on this device
    localStorage.setItem(WELCOME_POPUP_KEY, 'true');
  };

  return {
    showWelcome,
    visitorNumber,
    closeWelcome
  };
};
