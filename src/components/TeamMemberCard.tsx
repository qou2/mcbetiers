
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface TeamMemberCardProps {
  member: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  };
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <div 
        className="glass p-5 rounded-xl flex flex-col items-center text-center cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
        onClick={() => setIsModalOpen(true)}
      >
        <Avatar className="h-20 w-20">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        
        <h3 className="mt-3 font-bold text-lg">{member.name}</h3>
        <p className="text-white/60 text-sm">{member.role}</p>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0B0B0F] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{member.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center pt-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold mt-3">{member.name}</h2>
            <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm mt-2">
              {member.role}
            </span>
            
            <div className="mt-6 text-center">
              <p className="text-white/70">
                {member.bio || `${member.name} is a valued member of the MCBE TIERS team, contributing to the growth and success of our platform.`}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
