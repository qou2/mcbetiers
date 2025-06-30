
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  hasKnowledgeBase: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled, hasKnowledgeBase }: ChatInputProps) {
  return (
    <div className="p-3 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask a question about MCBE Tiers..."
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-xl px-3 py-2 h-auto"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {!hasKnowledgeBase && (
        <p className="text-xs text-white/50 mt-2 text-center">💡 Upload documents in Admin Tools for document-specific assistance</p>
      )}
    </div>
  );
}
