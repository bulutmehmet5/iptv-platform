'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/store/content-store';

interface ContentCardProps {
  id: number;
  title: string;
  posterUrl: string;
  type: 'movie' | 'series';
  year?: string;
  rating?: string;
  onClick?: () => void;
  className?: string;
}

export function ContentCard({
  id,
  title,
  posterUrl,
  type,
  year,
  rating,
  onClick,
  className,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { 
    isMovieFavorite, 
    isSeriesFavorite, 
    toggleFavoriteMovie, 
    toggleFavoriteSeries 
  } = useContentStore();
  
  const isFavorite = type === 'movie' 
    ? isMovieFavorite(id) 
    : isSeriesFavorite(id);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'movie') {
      toggleFavoriteMovie(id);
    } else {
      toggleFavoriteSeries(id);
    }
  };
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer group",
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
        <Image
          src={posterUrl || '/placeholder-poster.jpg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder on error
            (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
          }}
        />
        
        {/* Overlay on hover */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
            isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300"
          )}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold line-clamp-2">{title}</h3>
                <div className="flex items-center text-xs text-white/80 mt-1 space-x-2">
                  {year && <span>{year}</span>}
                  {rating && (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                      <span>{rating}</span>
                    </div>
                  )}
                  <span className="capitalize">{type}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={toggleFavorite}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4", 
                    isFavorite ? "fill-red-500 text-red-500" : "text-white"
                  )} 
                />
              </Button>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-2 gap-1"
            >
              <Play className="h-4 w-4" />
              {type === 'movie' ? 'Watch Now' : 'View Details'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Title for non-hover state on mobile */}
      <div className="md:hidden mt-2">
        <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
        <div className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-2">
          {year && <span>{year}</span>}
          {rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-0.5 text-yellow-400 fill-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}