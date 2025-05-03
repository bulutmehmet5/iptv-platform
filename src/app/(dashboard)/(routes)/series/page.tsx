'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CategorySelector } from '@/components/shared/category-selector';
import { ContentGrid } from '@/components/shared/content-grid';
import { ContentCard } from '@/components/shared/content-card';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getSeriesCategories, getSeriesByCategory } from '@/lib/api/xtream';
import { Series } from '@/types/content';

export default function SeriesPage() {
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    seriesCategories, 
    setSeriesCategories,
    seriesList,
    setSeries,
    selectedSeriesCategory,
    setSelectedSeriesCategory
  } = useContentStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeries, setCurrentSeries] = useState<Series[]>([]);
  
  // Fetch series categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!credentials) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const categories = await getSeriesCategories(
          credentials.server,
          credentials.username,
          credentials.password
        );
        
        setSeriesCategories(categories);
        
        // Select first category by default if none selected
        if (!selectedSeriesCategory && categories.length > 0) {
          setSelectedSeriesCategory(categories[0].category_id);
        }
      } catch (err) {
        console.error('Failed to fetch series categories:', err);
        setError('Failed to load series categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, [credentials, selectedSeriesCategory, setSeriesCategories, setSelectedSeriesCategory]);
  
  // Fetch series for selected category
  useEffect(() => {
    const fetchSeries = async () => {
      if (!credentials || !selectedSeriesCategory) return;
      
      // Check if we already have series for this category
      if (seriesList[selectedSeriesCategory]) {
        setCurrentSeries(seriesList[selectedSeriesCategory]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedSeries = await getSeriesByCategory(
          credentials.server,
          credentials.username,
          credentials.password,
          selectedSeriesCategory
        );
        
        setSeries(selectedSeriesCategory, fetchedSeries);
        setCurrentSeries(fetchedSeries);
      } catch (err) {
        console.error('Failed to fetch series:', err);
        setError('Failed to load series. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeries();
  }, [credentials, selectedSeriesCategory, seriesList, setSeries]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedSeriesCategory(null);
    } else {
      setSelectedSeriesCategory(categoryId);
    }
  };
  
  // Handle series selection
  const handleSeriesSelect = (series: Series) => {
    router.push(`/series/${series.series_id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">TV Series</h1>
          <p className="text-muted-foreground">
            Browse and watch your favorite TV shows
          </p>
        </div>
        
        {seriesCategories.length > 0 && (
          <CategorySelector
            categories={seriesCategories}
            selectedCategoryId={selectedSeriesCategory}
            onSelectCategory={handleCategorySelect}
            className="w-full md:w-auto"
          />
        )}
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {!isLoading && !error && currentSeries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No series found in this category</p>
        </div>
      )}
      
      {currentSeries.length > 0 && (
        <ContentGrid
          columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
          gap="medium"
        >
          {currentSeries.map((series) => (
            <ContentCard
              key={series.series_id}
              id={series.series_id}
              title={series.name}
              posterUrl={series.cover || ''}
              type="series"
              year={series.year || undefined}
              rating={series.rating || undefined}
              onClick={() => handleSeriesSelect(series)}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
}