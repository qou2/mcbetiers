
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, RefreshCw, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatWelcomeProps {
  hasKnowledgeBase: boolean;
  onRefresh: () => void;
}

export function ChatWelcome({ hasKnowledgeBase, onRefresh }: ChatWelcomeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 px-4"
    >
      <motion.div 
        className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Bot className="w-6 h-6 text-white" />
      </motion.div>
      <h4 className="text-lg font-bold text-white mb-2">MCBE Tiers Assistant</h4>
      <p className="text-white/90 text-sm mb-4">Professional support for competitive Minecraft Bedrock Edition</p>
      
      {!hasKnowledgeBase ? (
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <MessageSquare className="w-5 h-5 mx-auto mb-2 text-blue-400" />
            <p className="text-white/80 text-sm mb-2">
              I can help you with questions about:
            </p>
            <ul className="text-xs text-white/60 space-y-1">
              <li>• MCBE Tiers ranking system</li>
              <li>• Player statistics and tiers</li>
              <li>• Competitive gaming information</li>
              <li>• Platform features and navigation</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <FileText className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-white/70">
              For document-specific questions, upload files via Admin Panel
            </p>
          </div>
          <Button 
            onClick={onRefresh}
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-4 py-2 rounded-full text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Check for Documents
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <FileText className="w-5 h-5 mx-auto mb-2 text-green-400" />
            <p className="text-green-300 text-sm mb-1">Document Loaded Successfully</p>
            <p className="text-white/70 text-xs">Ready to answer questions about your uploaded document</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
