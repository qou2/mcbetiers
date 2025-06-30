
import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full py-4 border-t border-white/10 glass mt-auto animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <Link to="/" className="text-lg font-bold text-white/90">
            MCBE TIERS
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white/60 hover:text-white/80 transition-colors text-sm">Home</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-red-500 transition-colors">
                <Youtube size={18} />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-indigo-400 transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-gray-500 text-xs">© 2025 MCBE TIERS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
