'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Tv, Film, Clapperboard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/shared/content-card';
import { ChannelCard } from '@/components/shared/channel-card';
import { ContentGrid } from '@/components/shared/content-grid';
import { ContentRow } from '@/components/shared/content-row';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getLiveCategories, getLiveStreamsByCategory, getMovieCategories, getMoviesByCategory, getSeriesCategories, getSeriesByCategory } from '@/lib/api/xtream';

export default function DashboardPage() {
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    liveCategories,
    setLiveCategories,
    liveStreams,
    setLiveStreams,
    movieCategories,
    setMovieCategories,
    movies,
    setMovies,
    seriesCategories,
    setSeriesCategories,
    seriesList,
    setSeries,
    recentlyWatched
  } = useContentStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredLiveStreams, setFeaturedLiveStreams] = useState<any[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<any[]>([]);
  
  // Fetch initial content
  useEffect(() => {
    const fetchInitialContent = async () => {
      if (!credentials) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch live categories if not already loaded
        if (liveCategories.length === 0) {
          const categories = await getLiveCategories(
            credentials.server,
            credentials.username,
            credentials.password
          );
          setLiveCategories(categories);
          
          // Fetch streams for first category
          if (categories.length > 0) {
            const categoryId = categories[0].category_id;
            const streams = await getLiveStreamsByCategory(
              credentials.server,
              credentials.username,
              credentials.password,
              categoryId
            );
            setLiveStreams(categoryId, streams);
            setFeaturedLiveStreams(streams.slice(0, 8));
          }
        } else if (Object.keys(liveStreams).length > 0) {
          // Use existing streams if available
          const firstCategoryId = liveCategories[0].category_id;
          if (liveStreams[firstCategoryId]) {
            setFeaturedLiveStreams(liveStreams[firstCategoryId].slice(0, 8));
          }
        }
        
        // Fetch movie categories if not already loaded
        if (movieCategories.length === 0) {
          const categories = await getMovieCategories(
            credentials.server,
            credentials.username,
            credentials.password
          );
          setMovieCategories(categories);
          
          // Fetch movies for first category
          if (categories.length > 0) {
            const categoryId = categories[0].category_id;
            const moviesList = await getMoviesByCategory(
              credentials.server,
              credentials.username,
              credentials.password,
              categoryId
            );
            setMovies(categoryId, moviesList);
            setFeaturedMovies(moviesList.slice(0, 12));
          }
        } else if (Object.keys(movies).length > 0) {
          // Use existing movies if available
          const firstCategoryId = movieCategories[0].category_id;
          if (movies[firstCategoryId]) {
            setFeaturedMovies(movies[firstCategoryId].slice(0, 12));
          }
        }
        
        // Fetch series categories if not already loaded
        if (seriesCategories.length === 0) {
          const categories = await getSeriesCategories(
            credentials.server,
            credentials.username,
            credentials.password
          );
          setSeriesCategories(categories);
          
          // Fetch series for first category
          if (categories.length > 0) {
            const categoryId = categories[0].category_id;
            const seriesList = await getSeriesByCategory(
              credentials.server,
              credentials.username,
              credentials.password,
              categoryId
            );
            setSeries(categoryId, seriesList);
            setFeaturedSeries(seriesList.slice(0, 12));
          }
        } else if (Object.keys(seriesList).length > 0) {
          // Use existing series if available
          const firstCategoryId = seriesCategories[0].category_id;
          if (seriesList[firstCategoryId]) {
            setFeaturedSeries(seriesList[firstCategoryId].slice(0, 12));
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialContent();
  }, [credentials, liveCategories, movieCategories, seriesCategories]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-10">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to IPTV Platform</h1>
        <p className="text-muted-foreground mt-2">
          Discover and enjoy your favorite content
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* Recently Watched */}
      {recentlyWatched.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Continue Watching
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/profile')}
            >
              View All
            </Button>
          </div>
          
          <ContentRow>
            {recentlyWatched.slice(0, 6).map((item) => (
              <div 
                key={`${item.type}-${item.id}`}
                className="w-[280px] flex-shrink-0"
              >
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  <div 
                    className="absolute bottom-2 left-2 z-20 px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground"
                  >
                    {item.type === 'live' ? 'Live TV' : item.type === 'movie' ? 'Movie' : 'Series'}
                  </div>
                  <img 
                    src={item.thumbnailUrl || '/placeholder-thumbnail.jpg'} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="text-white font-semibold line-clamp-1">{item.title}</h3>
                    {item.type === 'series' && item.episodeInfo && (
                      <p className="text-sm text-white/80 mt-1">
                        S{item.episodeInfo.seasonNumber} E{item.episodeInfo.episodeNumber}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity"
                    variant="ghost"
                    onClick={() => {
                      if (item.type === 'live') {
                        router.push('/live');
                      } else if (item.type === 'movie') {
                        router.push(`/movies/${item.id}`);
                      } else if (item.type === 'series' && item.episodeInfo) {
                        router.push(`/series/${item.episodeInfo.seriesId}`);
                      }
                    }}
                  >
                    <Play className="h-12 w-12" />
                  </Button>
                </div>
              </div>
            ))}
          </ContentRow>
        </div>
      )}
      
      {/* Live TV Section */}
      {featuredLiveStreams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Live TV
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/live')}
            >
              View All
            </Button>
          </div>
          
          <ContentGrid
            columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            gap="medium"
          >
            {featuredLiveStreams.map((stream) => (
              <ChannelCard
                key={stream.stream_id}
                id={stream.stream_id}
                name={stream.name}
                logoUrl={stream.stream_icon || ''}
                onClick={() => router.push('/live')}
              />
            ))}
          </ContentGrid>
        </div>
      )}
      
      {/* Movies Section */}
      {featuredMovies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Film className="h-5 w-5" />
              Movies
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/movies')}
            >
              View All
            </Button>
          </div>
          
          <ContentRow>
            {featuredMovies.map((movie) => (
              <div 
                key={movie.stream_id}
                className="w-[180px] md:w-[200px] flex-shrink-0"
              >
                <ContentCard
                  id={movie.stream_id}
                  title={movie.name}
                  posterUrl={movie.stream_icon || ''}
                  type="movie"
                  year={movie.year || undefined}
                  rating={movie.rating || undefined}
                  onClick={() => router.push(`/movies/${movie.stream_id}`)}
                />
              </div>
            ))}
          </ContentRow>
        </div>
      )}
      
      {/* Series Section */}
      {featuredSeries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clapperboard className="h-5 w-5" />
              TV Series
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/series')}
            >
              View All
            </Button>
          </div>
          
          <ContentRow>
            {featuredSeries.map((series) => (
              <div 
                key={series.series_id}
                className="w-[180px] md:w-[200px] flex-shrink-0"
              >
                <ContentCard
                  id={series.series_id}
                  title={series.name}
                  posterUrl={series.cover || ''}
                  type="series"
                  year={series.year || undefined}
                  rating={series.rating || undefined}
                  onClick={() => router.push(`/series/${series.series_id}`)}
                />
              </div>
            ))}
          </ContentRow>
        </div>
      )}
    </div>
  );
}