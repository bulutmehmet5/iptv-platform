'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CategorySelector } from '@/components/shared/category-selector';
import { ContentGrid } from '@/components/shared/content-grid';
import { ContentCard } from '@/components/shared/content-card';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getMovieCategories, getMoviesByCategory } from '@/lib/api/xtream';
import { Movie } from '@/types/content';
import { getImageUrl } from '@/lib/api/tmdb';

export default function MoviesPage() {
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    movieCategories, 
    setMovieCategories,
    movies,
    setMovies,
    selectedMovieCategory,
    setSelectedMovieCategory
  } = useContentStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  
  // Fetch movie categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!credentials) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const categories = await getMovieCategories(
          credentials.server,
          credentials.username,
          credentials.password
        );
        
        setMovieCategories(categories);
        
        // Select first category by default if none selected
        if (!selectedMovieCategory && categories.length > 0) {
          setSelectedMovieCategory(categories[0].category_id);
        }
      } catch (err) {
        console.error('Failed to fetch movie categories:', err);
        setError('Failed to load movie categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, [credentials, selectedMovieCategory, setMovieCategories, setSelectedMovieCategory]);
  
  // Fetch movies for selected category
  useEffect(() => {
    const fetchMovies = async () => {
      if (!credentials || !selectedMovieCategory) return;
      
      // Check if we already have movies for this category
      if (movies[selectedMovieCategory]) {
        setCurrentMovies(movies[selectedMovieCategory]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedMovies = await getMoviesByCategory(
          credentials.server,
          credentials.username,
          credentials.password,
          selectedMovieCategory
        );
        
        setMovies(selectedMovieCategory, fetchedMovies);
        setCurrentMovies(fetchedMovies);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, [credentials, selectedMovieCategory, movies, setMovies]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedMovieCategory(null);
    } else {
      setSelectedMovieCategory(categoryId);
    }
  };
  
  // Handle movie selection
  const handleMovieSelect = (movie: Movie) => {
    router.push(`/movies/${movie.stream_id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Movies</h1>
          <p className="text-muted-foreground">
            Browse and watch your favorite movies
          </p>
        </div>
        
        {movieCategories.length > 0 && (
          <CategorySelector
            categories={movieCategories}
            selectedCategoryId={selectedMovieCategory}
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
      
      {!isLoading && !error && currentMovies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies found in this category</p>
        </div>
      )}
      
      {currentMovies.length > 0 && (
        <ContentGrid
          columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
          gap="medium"
        >
          {currentMovies.map((movie) => (
            <ContentCard
              key={movie.stream_id}
              id={movie.stream_id}
              title={movie.name}
              posterUrl={movie.stream_icon || ''}
              type="movie"
              year={movie.year || undefined}
              rating={movie.rating || undefined}
              onClick={() => handleMovieSelect(movie)}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
}