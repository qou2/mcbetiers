
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Users } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  visitorNumber: number;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose, visitorNumber }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] mx-auto bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 backdrop-blur-lg">
        <div className="relative p-6 text-center">
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header with sparkles */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-purple-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Welcome message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              👋 Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">MCBE Tiers</span>, dear.
            </h2>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              This tier list was created by{' '}
              <span className="text-purple-400 font-semibold">Jamal Hussain</span> and{' '}
              <span className="text-blue-400 font-semibold">Swaify</span>.
            </p>

            {/* Visitor counter */}
            <div className="flex items-center justify-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
              <Users className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">
                🎉 You are visitor <span className="text-green-400 font-bold">#{visitorNumber.toLocaleString()}</span> to our site.
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Explore MCBE Tiers
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
