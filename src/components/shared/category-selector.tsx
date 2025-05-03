'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category } from '@/types/content';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className,
}: CategorySelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Check if scroll arrows should be shown
  const checkScrollArrows = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };
  
  // Scroll left/right
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300; // Adjust as needed
    const currentScroll = scrollContainerRef.current.scrollLeft;
    
    scrollContainerRef.current.scrollTo({
      left: direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount,
      behavior: 'smooth',
    });
  };
  
  // Check arrows on mount and when categories change
  useEffect(() => {
    checkScrollArrows();
    
    // Add resize listener
    window.addEventListener('resize', checkScrollArrows);
    
    return () => {
      window.removeEventListener('resize', checkScrollArrows);
    };
  }, [categories]);
  
  return (
    <div className={cn("relative", className)}>
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {/* Categories */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-1 -mx-1 snap-x"
        onScroll={checkScrollArrows}
      >
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          className="whitespace-nowrap mr-2 snap-start"
          onClick={() => onSelectCategory('all')}
        >
          All Categories
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.category_id}
            variant={selectedCategoryId === category.category_id ? "default" : "outline"}
            className="whitespace-nowrap mr-2 snap-start"
            onClick={() => onSelectCategory(category.category_id)}
          >
            {category.category_name}
          </Button>
        ))}
      </div>
      
      {/* Right scroll arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}