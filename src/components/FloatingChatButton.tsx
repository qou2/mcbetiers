
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 rounded-full shadow-xl flex items-center justify-center group transition-all duration-300 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.4)'
          }}
        >
          {/* Animated background gradient */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%)'
            }}
          />
          
          {/* Main icon */}
          <motion.div
            className="relative z-10"
            animate={{ 
              rotate: isOpen ? 180 : 0,
              scale: isOpen ? 0.9 : 1
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            {isOpen ? (
              <Sparkles className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <MessageSquare className="w-5 h-5 text-white drop-shadow-lg" />
            )}
          </motion.div>

          {/* Pulse effect */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-white/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Status indicator */}
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-white/30"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.div>
        </motion.button>
      </motion.div>

      <ChatWidget isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  );
}
