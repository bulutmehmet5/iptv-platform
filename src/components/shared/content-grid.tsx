'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'small' | 'medium' | 'large';
}

export function ContentGrid({
  children,
  className,
  columns = {
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  gap = 'medium',
}: ContentGridProps) {
  // Generate grid columns classes
  const gridColsClasses = [
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean);
  
  // Generate gap classes
  const gapClass = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6',
  }[gap];
  
  return (
    <div
      className={cn(
        "grid",
        ...gridColsClasses,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
}