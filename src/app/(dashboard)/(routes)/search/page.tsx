'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, Tv, Film, Clapperboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentGrid } from '@/components/shared/content-grid';
import { ContentCard } from '@/components/shared/content-card';
import { ChannelCard } from '@/components/shared/channel-card';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { LiveStream, Movie, Series } from '@/types/content';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { credentials } = useAuthStore();
  const { 
    liveStreams,
    movies,
    seriesList
  } = useContentStore();
  
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    live: LiveStream[];
    movies: Movie[];
    series: Series[];
  }>({
    live: [],
    movies: [],
    series: []
  });
  
  // Perform search when query changes
  useEffect(() => {
    if (!initialQuery) return;
    
    performSearch(initialQuery);
  }, [initialQuery]);
  
  // Search all content
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ live: [], movies: [], series: [] });
      return;
    }
    
    setIsSearching(true);
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search live streams
    const matchedLiveStreams: LiveStream[] = [];
    Object.values(liveStreams).forEach(categoryStreams => {
      categoryStreams.forEach(stream => {
        if (stream.name.toLowerCase().includes(normalizedQuery)) {
          matchedLiveStreams.push(stream);
        }
      });
    });
    
    // Search movies
    const matchedMovies: Movie[] = [];
    Object.values(movies).forEach(categoryMovies => {
      categoryMovies.forEach(movie => {
        if (movie.name.toLowerCase().includes(normalizedQuery)) {
          matchedMovies.push(movie);
        }
      });
    });
    
    // Search series
    const matchedSeries: Series[] = [];
    Object.values(seriesList).forEach(categorySeries => {
      categorySeries.forEach(series => {
        if (series.name.toLowerCase().includes(normalizedQuery)) {
          matchedSeries.push(series);
        }
      });
    });
    
    setSearchResults({
      live: matchedLiveStreams,
      movies: matchedMovies,
      series: matchedSeries
    });
    
    setIsSearching(false);
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    router.push(`/search?${params.toString()}`);
    performSearch(searchQuery);
  };
  
  // Get total results count
  const totalResults = searchResults.live.length + searchResults.movies.length + searchResults.series.length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find your favorite content
        </p>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for channels, movies, or series..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      {/* Search Results */}
      {initialQuery && (
        <div className="pt-4">
          {isSearching ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Results for "{initialQuery}"
                </h2>
                <div className="text-sm text-muted-foreground">
                  {totalResults} results found
                </div>
              </div>
              
              {totalResults === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      All ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="live" className="flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      Live TV ({searchResults.live.length})
                    </TabsTrigger>
                    <TabsTrigger value="movies" className="flex items-center gap-2">
                      <Film className="h-4 w-4" />
                      Movies ({searchResults.movies.length})
                    </TabsTrigger>
                    <TabsTrigger value="series" className="flex items-center gap-2">
                      <Clapperboard className="h-4 w-4" />
                      Series ({searchResults.series.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* All Results */}
                  <TabsContent value="all" className="space-y-8">
                    {/* Live TV Results */}
                    {searchResults.live.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Tv className="h-4 w-4" />
                          Live TV
                        </h3>
                        
                        <ContentGrid
                          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                          gap="medium"
                        >
                          {searchResults.live.slice(0, 4).map((stream) => (
                            <ChannelCard
                              key={stream.stream_id}
                              id={stream.stream_id}
                              name={stream.name}
                              logoUrl={stream.stream_icon || ''}
                              onClick={() => router.push('/live')}
                            />
                          ))}
                        </ContentGrid>
                        
                        {searchResults.live.length > 4 && (
                          <div className="flex justify-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveTab('live')}
                            >
                              View All Live TV Results
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Movies Results */}
                    {searchResults.movies.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Film className="h-4 w-4" />
                          Movies
                        </h3>
                        
                        <ContentGrid
                          columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                          gap="medium"
                        >
                          {searchResults.movies.slice(0, 10).map((movie) => (
                            <ContentCard
                              key={movie.stream_id}
                              id={movie.stream_id}
                              title={movie.name}
                              posterUrl={movie.stream_icon || ''}
                              type="movie"
                              year={movie.year || undefined}
                              rating={movie.rating || undefined}
                              onClick={() => router.push(`/movies/${movie.stream_id}`)}
                            />
                          ))}
                        </ContentGrid>
                        
                        {searchResults.movies.length > 10 && (
                          <div className="flex justify-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveTab('movies')}
                            >
                              View All Movie Results
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Series Results */}
                    {searchResults.series.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Clapperboard className="h-4 w-4" />
                          Series
                        </h3>
                        
                        <ContentGrid
                          columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                          gap="medium"
                        >
                          {searchResults.series.slice(0, 10).map((series) => (
                            <ContentCard
                              key={series.series_id}
                              id={series.series_id}
                              title={series.name}
                              posterUrl={series.cover || ''}
                              type="series"
                              year={series.year || undefined}
                              rating={series.rating || undefined}
                              onClick={() => router.push(`/series/${series.series_id}`)}
                            />
                          ))}
                        </ContentGrid>
                        
                        {searchResults.series.length > 10 && (
                          <div className="flex justify-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setActiveTab('series')}
                            >
                              View All Series Results
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Live TV Results */}
                  <TabsContent value="live">
                    {searchResults.live.length > 0 ? (
                      <ContentGrid
                        columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                        gap="medium"
                      >
                        {searchResults.live.map((stream) => (
                          <ChannelCard
                            key={stream.stream_id}
                            id={stream.stream_id}
                            name={stream.name}
                            logoUrl={stream.stream_icon || ''}
                            onClick={() => router.push('/live')}
                          />
                        ))}
                      </ContentGrid>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No live TV channels found</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Movies Results */}
                  <TabsContent value="movies">
                    {searchResults.movies.length > 0 ? (
                      <ContentGrid
                        columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                        gap="medium"
                      >
                        {searchResults.movies.map((movie) => (
                          <ContentCard
                            key={movie.stream_id}
                            id={movie.stream_id}
                            title={movie.name}
                            posterUrl={movie.stream_icon || ''}
                            type="movie"
                            year={movie.year || undefined}
                            rating={movie.rating || undefined}
                            onClick={() => router.push(`/movies/${movie.stream_id}`)}
                          />
                        ))}
                      </ContentGrid>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No movies found</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Series Results */}
                  <TabsContent value="series">
                    {searchResults.series.length > 0 ? (
                      <ContentGrid
                        columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                        gap="medium"
                      >
                        {searchResults.series.map((series) => (
                          <ContentCard
                            key={series.series_id}
                            id={series.series_id}
                            title={series.name}
                            posterUrl={series.cover || ''}
                            type="series"
                            year={series.year || undefined}
                            rating={series.rating || undefined}
                            onClick={() => router.push(`/series/${series.series_id}`)}
                          />
                        ))}
                      </ContentGrid>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No series found</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}