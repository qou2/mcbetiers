
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { ChatWelcome } from './chat/ChatWelcome';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshKnowledgeBaseStatus = () => {
    console.log('Refreshing knowledge base status...');
    const hasKb = knowledgeBaseService.refreshKnowledgeBaseStatus();
    setHasKnowledgeBase(hasKb);
    console.log('Refreshed KB status - Has KB:', hasKb);
    
    const history = knowledgeBaseService.getChatHistory();
    console.log('Refreshed chat history:', history.length, 'messages');
    setMessages(history);
    
    return hasKb;
  };

  useEffect(() => {
    console.log('ChatWidget mounting, initializing...');
    setIsInitializing(true);
    
    const initTimer = setTimeout(() => {
      refreshKnowledgeBaseStatus();
      setIsInitializing(false);
      console.log('ChatWidget initialization complete');
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (isOpen && !isInitializing) {
      console.log('Chat widget opened, loading fresh data...');
      refreshKnowledgeBaseStatus();
      setError(null);
    }
  }, [isOpen, isInitializing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      knowledgeBaseService.clearConversation();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) {
      console.log('Cannot send message: empty input or loading');
      return;
    }

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    console.log('Sending message:', userMessage);

    try {
      const response = await knowledgeBaseService.sendMessage(userMessage);
      console.log('Received response:', response);
      
      const updatedHistory = knowledgeBaseService.getChatHistory();
      console.log('Updated chat history:', updatedHistory.length, 'messages');
      setMessages(updatedHistory);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-20 right-4 w-80 h-96 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            <div className="relative flex-1 flex items-center justify-center">
              <div className="text-center">
                <motion.div 
                  className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Bot className="w-6 h-6 text-white" />
                </motion.div>
                <p className="text-white/80 text-sm">Getting ready to chat... 💕</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-20 right-4 w-80 h-96 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset'
            }}
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Header */}
            <ChatHeader 
              hasKnowledgeBase={hasKnowledgeBase}
              onClose={onToggle}
              onRefresh={refreshKnowledgeBaseStatus}
            />

            {/* Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-red-500/20 backdrop-blur-sm px-3 py-2 text-xs text-red-200 flex items-center gap-2 border-b border-red-500/30"
              >
                <AlertCircle className="w-3 h-3 text-red-300 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Chat Messages */}
            <div className="relative flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {messages.length === 0 ? (
                    <ChatWelcome 
                      hasKnowledgeBase={hasKnowledgeBase}
                      onRefresh={refreshKnowledgeBaseStatus}
                    />
                  ) : (
                    messages.map((message, index) => (
                      <ChatMessage key={message.id} message={message} index={index} />
                    ))
                  )}
                  
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-white/10 border border-white/20 p-3 rounded-2xl backdrop-blur-sm">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-100" />
                            <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isLoading}
              hasKnowledgeBase={hasKnowledgeBase}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
