
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  author: string;
  created_at: string;
}

interface NewsArticleCardProps {
  article: NewsArticle;
  onClick?: (article: NewsArticle) => void;
}

// Export as a named export
export function NewsArticleCard({ article, onClick }: NewsArticleCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Format the date
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(article);
    } else {
      setIsDialogOpen(true);
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="h-full cursor-pointer hover:bg-dark-surface/50 transition-colors"
          onClick={handleCardClick}
        >
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-bold mb-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {article.description.substring(0, 150)}
                {article.description.length > 150 ? '...' : ''}
              </p>
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
              <span>{formattedDate}</span>
              <span>By {article.author}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <AnimatePresence>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">{article.title}</DialogTitle>
              <DialogDescription className="text-right text-sm">
                By {article.author} • {formattedDate}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {article.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  );
}
