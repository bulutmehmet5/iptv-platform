'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/store/content-store';

interface ChannelCardProps {
  id: number;
  name: string;
  logoUrl: string;
  currentProgram?: string;
  nextProgram?: string;
  onClick?: () => void;
  onInfoClick?: () => void;
  className?: string;
}

export function ChannelCard({
  id,
  name,
  logoUrl,
  currentProgram,
  nextProgram,
  onClick,
  onInfoClick,
  className,
}: ChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isLiveStreamFavorite, toggleFavoriteLiveStream } = useContentStore();
  
  const isFavorite = isLiveStreamFavorite(id);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteLiveStream(id);
  };
  
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfoClick) onInfoClick();
  };
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer group border border-border",
        className
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between">
          {/* Channel Logo */}
          <div className="relative h-12 w-12 overflow-hidden rounded">
            <Image
              src={logoUrl || '/placeholder-channel.png'}
              alt={name}
              fill
              sizes="48px"
              className="object-contain"
              onError={(e) => {
                // Fallback to placeholder on error
                (e.target as HTMLImageElement).src = '/placeholder-channel.png';
              }}
            />
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={toggleFavorite}
          >
            <Heart 
              className={cn(
                "h-4 w-4", 
                isFavorite ? "fill-red-500 text-red-500" : ""
              )} 
            />
          </Button>
        </div>
        
        {/* Channel Name */}
        <h3 className="mt-2 font-medium line-clamp-1">{name}</h3>
        
        {/* Current Program */}
        {currentProgram && (
          <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
            <span className="text-xs bg-primary/20 text-primary px-1 rounded mr-1">Now</span>
            {currentProgram}
          </div>
        )}
        
        {/* Next Program */}
        {nextProgram && (
          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
            <span className="text-xs bg-muted text-muted-foreground px-1 rounded mr-1">Next</span>
            {nextProgram}
          </div>
        )}
        
        {/* Action Buttons */}
        <div 
          className={cn(
            "mt-auto pt-2 flex gap-2",
            isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200"
          )}
        >
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 gap-1"
          >
            <Play className="h-4 w-4" />
            Watch
          </Button>
          
          {onInfoClick && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleInfoClick}
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}