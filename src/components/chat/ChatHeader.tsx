
import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  hasKnowledgeBase: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ChatHeader({ hasKnowledgeBase, onClose, onRefresh }: ChatHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <motion.div 
              className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${hasKnowledgeBase ? 'bg-green-400' : 'bg-orange-400'} shadow-lg`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h3 className="text-white font-semibold text-sm">MCBE Tiers Assistant</h3>
            <p className="text-white/90 text-xs">
              {hasKnowledgeBase ? 'Document-enhanced support' : 'General assistance available'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full"
            title="Refresh knowledge base status"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
