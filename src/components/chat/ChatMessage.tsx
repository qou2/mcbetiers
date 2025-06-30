
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessage;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            : 'bg-white/10 text-white border border-white/10'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        <div className="text-xs opacity-70 mt-2 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.div>
  );
}
