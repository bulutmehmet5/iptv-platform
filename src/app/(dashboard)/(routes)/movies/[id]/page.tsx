'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Play, ArrowLeft, Star, Clock, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/player/video-player';
import { ContentCard } from '@/components/shared/content-card';
import { ContentGrid } from '@/components/shared/content-grid';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getMovieInfo, getMovieStreamUrl } from '@/lib/api/xtream';
import { searchMovie, getMovieDetails, getSimilarMovies, getImageUrl } from '@/lib/api/tmdb';
import { Movie, TMDBMovie, PlaybackInfo } from '@/types/content';
import { cn } from '@/lib/utils';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    isMovieFavorite, 
    toggleFavoriteMovie,
    setCurrentPlayback
  } = useContentStore();
  
  const movieId = Number(params.id);
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Check if movie is favorite
  const isFavorite = isMovieFavorite(movieId);
  
  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!credentials || !movieId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch movie from Xtream API
        const movieDetails = await getMovieInfo(
          credentials.server,
          credentials.username,
          credentials.password,
          movieId
        );
        
        setMovie(movieDetails);
        
        // Fetch additional details from TMDB
        if (movieDetails.name) {
          const searchResults = await searchMovie(movieDetails.name);
          
          if (searchResults.length > 0) {
            // Get the most relevant result
            const bestMatch = searchResults[0];
            
            // Fetch full movie details
            const fullDetails = await getMovieDetails(bestMatch.id);
            setTmdbMovie(fullDetails);
            
            // Fetch similar movies
            const similar = await getSimilarMovies(bestMatch.id);
            setSimilarMovies(similar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [credentials, movieId]);
  
  // Handle play button click
  const handlePlay = () => {
    if (!credentials || !movie) return;
    
    const streamUrl = getMovieStreamUrl(
      credentials.server,
      credentials.username,
      credentials.password,
      movie.stream_id,
      movie.container_extension
    );
    
    const playbackInfo: PlaybackInfo = {
      id: movie.stream_id,
      title: movie.name,
      streamUrl,
      type: 'movie',
      thumbnailUrl: movie.stream_icon || tmdbMovie?.poster_path 
        ? getImageUrl(tmdbMovie.poster_path) 
        : '',
    };
    
    setCurrentPlayback(playbackInfo);
    setIsPlaying(true);
  };
  
  // Handle back button click
  const handleBack = () => {
    router.back();
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    toggleFavoriteMovie(movieId);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error || 'Movie not found'}
      </div>
    );
  }
  
  // Use TMDB backdrop if available, otherwise use stream icon
  const backdropUrl = tmdbMovie?.backdrop_path 
    ? getImageUrl(tmdbMovie.backdrop_path, 'original') 
    : movie.stream_icon || '';
  
  // Use TMDB poster if available, otherwise use stream icon
  const posterUrl = tmdbMovie?.poster_path 
    ? getImageUrl(tmdbMovie.poster_path) 
    : movie.stream_icon || '';
  
  return (
    <div className="space-y-8">
      {isPlaying && movie && credentials ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsPlaying(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
          
          <VideoPlayer
            playbackInfo={{
              id: movie.stream_id,
              title: movie.name,
              streamUrl: getMovieStreamUrl(
                credentials.server,
                credentials.username,
                credentials.password,
                movie.stream_id,
                movie.container_extension
              ),
              type: 'movie',
              thumbnailUrl: posterUrl,
            }}
            className="rounded-lg overflow-hidden"
          />
        </div>
      ) : (
        <>
          {/* Movie Header with Backdrop */}
          <div className="relative">
            {/* Back Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-4 left-4 z-10 gap-1 bg-background/80 backdrop-blur-sm"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {/* Backdrop Image */}
            <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden rounded-lg">
              {backdropUrl && (
                <Image
                  src={backdropUrl}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            
            {/* Movie Info */}
            <div className="container relative -mt-40 md:-mt-60 z-10 flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="w-40 md:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={posterUrl || '/placeholder-poster.jpg'}
                  alt={movie.name}
                  width={256}
                  height={384}
                  className="w-full h-auto"
                  priority
                />
              </div>
              
              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{movie.name}</h1>
                  {tmdbMovie?.tagline && (
                    <p className="text-muted-foreground mt-1 italic">
                      {tmdbMovie.tagline}
                    </p>
                  )}
                </div>
                
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4">
                  {movie.year && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{movie.year}</span>
                    </div>
                  )}
                  
                  {movie.duration && (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{movie.duration} min</span>
                    </div>
                  )}
                  
                  {(movie.rating || tmdbMovie?.vote_average) && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>
                        {movie.rating || (tmdbMovie?.vote_average ? (tmdbMovie.vote_average / 2).toFixed(1) : '')}
                        /5
                      </span>
                    </div>
                  )}
                  
                  {tmdbMovie?.genres && tmdbMovie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tmdbMovie.genres.map((genre) => (
                        <span 
                          key={genre.id}
                          className="px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-sm md:text-base">
                  {tmdbMovie?.overview || movie.plot || 'No description available.'}
                </p>
                
                {/* Cast (if available from TMDB) */}
                {tmdbMovie?.credits?.cast && tmdbMovie.credits.cast.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {tmdbMovie.credits.cast.slice(0, 6).map((actor) => (
                        <span 
                          key={actor.id}
                          className="px-3 py-1 bg-accent rounded-full text-sm"
                        >
                          {actor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={handlePlay}
                  >
                    <Play className="h-5 w-5" />
                    Play
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className={cn(
                      "gap-2",
                      isFavorite && "text-red-500 border-red-500"
                    )}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={cn(
                      "h-5 w-5",
                      isFavorite && "fill-red-500"
                    )} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div className="mt-12 space-y-4">
              <h2 className="text-xl font-semibold">Similar Movies</h2>
              <ContentGrid
                columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                gap="medium"
              >
                {similarMovies.slice(0, 10).map((movie) => (
                  <ContentCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.poster_path ? getImageUrl(movie.poster_path) : ''}
                    type="movie"
                    year={movie.release_date?.substring(0, 4)}
                    rating={(movie.vote_average / 2).toFixed(1)}
                    onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank')}
                  />
                ))}
              </ContentGrid>
            </div>
          )}
        </>
      )}
    </div>
  );
}