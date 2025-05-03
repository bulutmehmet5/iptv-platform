'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Play, ArrowLeft, Star, Calendar, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VidstackPlayer } from '@/components/player/vidstack-player';
import { ContentCard } from '@/components/shared/content-card';
import { ContentGrid } from '@/components/shared/content-grid';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getSeriesInfo, getEpisodeStreamUrl } from '@/lib/api/xtream';
import { searchTVSeries, getTVSeriesDetails, getSimilarTVSeries, getImageUrl } from '@/lib/api/tmdb';
import { Series, Episode, TMDBSeries, PlaybackInfo } from '@/types/content';
import { cn } from '@/lib/utils';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    isSeriesFavorite, 
    toggleFavoriteSeries,
    setCurrentPlayback
  } = useContentStore();
  
  const seriesId = Number(params.id);
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Record<string, Episode[]>>({});
  const [tmdbSeries, setTmdbSeries] = useState<TMDBSeries | null>(null);
  const [similarSeries, setSimilarSeries] = useState<TMDBSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Check if series is favorite
  const isFavorite = isSeriesFavorite(seriesId);
  
  // Fetch series details
  useEffect(() => {
    const fetchSeriesDetails = async () => {
      if (!credentials || !seriesId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch series from Xtream API
        const seriesDetails = await getSeriesInfo(
          credentials.server,
          credentials.username,
          credentials.password,
          seriesId
        );
        
        setSeries(seriesDetails.info);
        setEpisodes(seriesDetails.episodes);
        
        // Set first season as selected by default
        const seasonKeys = Object.keys(seriesDetails.episodes);
        if (seasonKeys.length > 0 && !selectedSeason) {
          setSelectedSeason(seasonKeys[0]);
        }
        
        // Fetch additional details from TMDB
        if (seriesDetails.info.name) {
          const searchResults = await searchTVSeries(seriesDetails.info.name);
          
          if (searchResults.length > 0) {
            // Get the most relevant result
            const bestMatch = searchResults[0];
            
            // Fetch full series details
            const fullDetails = await getTVSeriesDetails(bestMatch.id);
            setTmdbSeries(fullDetails);
            
            // Fetch similar series
            const similar = await getSimilarTVSeries(bestMatch.id);
            setSimilarSeries(similar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch series details:', err);
        setError('Failed to load series details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeriesDetails();
  }, [credentials, seriesId, selectedSeason]);
  
  // Handle play episode
  const handlePlayEpisode = (episode: Episode) => {
    if (!credentials || !series) return;
    
    const streamUrl = getEpisodeStreamUrl(
      credentials.server,
      credentials.username,
      credentials.password,
      episode.id,
      episode.container_extension
    );
    
    const playbackInfo: PlaybackInfo = {
      id: episode.id,
      title: `${series.name} - S${episode.season_num}E${episode.episode_num}: ${episode.title || ''}`,
      streamUrl,
      type: 'series',
      thumbnailUrl: episode.info?.movie_image || series.cover || '',
      episodeInfo: {
        seriesId: series.series_id,
        seasonNumber: episode.season_num,
        episodeNumber: episode.episode_num,
        episodeTitle: episode.title || '',
      }
    };
    
    setCurrentPlayback(playbackInfo);
    setSelectedEpisode(episode);
    setIsPlaying(true);
  };
  
  // Handle back button click
  const handleBack = () => {
    router.back();
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    toggleFavoriteSeries(seriesId);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !series) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error || 'Series not found'}
      </div>
    );
  }
  
  // Use TMDB backdrop if available, otherwise use series cover
  const backdropUrl = tmdbSeries?.backdrop_path 
    ? getImageUrl(tmdbSeries.backdrop_path, 'original') 
    : series.backdrop_path || series.cover || '';
  
  // Use TMDB poster if available, otherwise use series cover
  const posterUrl = tmdbSeries?.poster_path 
    ? getImageUrl(tmdbSeries.poster_path) 
    : series.cover || '';
  
  // Get seasons list
  const seasons = Object.keys(episodes).sort((a, b) => Number(a) - Number(b));
  
  // Get episodes for selected season
  const seasonEpisodes = selectedSeason ? episodes[selectedSeason] || [] : [];
  
  return (
    <div className="space-y-8">
      {isPlaying && selectedEpisode && credentials ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setIsPlaying(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Button>
          
          <VidstackPlayer
            playbackInfo={{
              id: selectedEpisode.id,
              title: `${series.name} - S${selectedEpisode.season_num}E${selectedEpisode.episode_num}: ${selectedEpisode.title || ''}`,
              streamUrl: getEpisodeStreamUrl(
                credentials.server,
                credentials.username,
                credentials.password,
                selectedEpisode.id,
                selectedEpisode.container_extension
              ),
              type: 'series',
              thumbnailUrl: selectedEpisode.info?.movie_image || series.cover || '',
              episodeInfo: {
                seriesId: series.series_id,
                seasonNumber: selectedEpisode.season_num,
                episodeNumber: selectedEpisode.episode_num,
                episodeTitle: selectedEpisode.title || '',
              }
            }}
          />
          
          <div className="pt-4">
            <h2 className="text-xl font-semibold">
              S{selectedEpisode.season_num}E{selectedEpisode.episode_num}: {selectedEpisode.title || 'Episode ' + selectedEpisode.episode_num}
            </h2>
            {selectedEpisode.info?.plot && (
              <p className="mt-2 text-muted-foreground">
                {selectedEpisode.info.plot}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Series Header with Backdrop */}
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
                  alt={`${series.name} backdrop image`}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            
            {/* Series Info */}
            <div className="container relative -mt-40 md:-mt-60 z-10 flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="w-40 md:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={posterUrl || '/placeholder-poster.jpg'}
                  alt={`${series.name} series poster`}
                  width={256}
                  height={384}
                  className="w-full h-auto"
                  priority
                />
              </div>
              
              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{series.name}</h1>
                  {tmdbSeries?.tagline && (
                    <p className="text-muted-foreground mt-1 italic">
                      {tmdbSeries.tagline}
                    </p>
                  )}
                </div>
                
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4">
                  {series.year && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{series.year}</span>
                    </div>
                  )}
                  
                  {(series.rating || tmdbSeries?.vote_average) && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>
                        {series.rating || (tmdbSeries?.vote_average ? (tmdbSeries.vote_average / 2).toFixed(1) : '')}
                        /5
                      </span>
                    </div>
                  )}
                  
                  {tmdbSeries?.genres && tmdbSeries.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tmdbSeries.genres.map((genre) => (
                        <span 
                          key={genre.id}
                          className="px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {seasons.length > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <span>{seasons.length} Season{seasons.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-sm md:text-base">
                  {tmdbSeries?.overview || series.plot || 'No description available.'}
                </p>
                
                {/* Cast (if available from TMDB) */}
                {tmdbSeries?.credits?.cast && tmdbSeries.credits.cast.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {tmdbSeries.credits.cast.slice(0, 6).map((actor) => (
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
                  {seasonEpisodes.length > 0 && (
                    <Button 
                      size="lg" 
                      className="gap-2"
                      onClick={() => handlePlayEpisode(seasonEpisodes[0])}
                    >
                      <Play className="h-5 w-5" />
                      Play First Episode
                    </Button>
                  )}
                  
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
          
          {/* Episodes */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Episodes</h2>
            
            {seasons.length > 0 ? (
              <Tabs 
                defaultValue={selectedSeason} 
                value={selectedSeason}
                onValueChange={setSelectedSeason}
                className="w-full"
              >
                <TabsList className="mb-4 flex flex-wrap h-auto">
                  {seasons.map((season) => (
                    <TabsTrigger key={season} value={season}>
                      Season {season}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {seasons.map((season) => (
                  <TabsContent key={season} value={season} className="space-y-4">
                    {episodes[season]?.map((episode) => (
                      <div 
                        key={episode.id}
                        className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handlePlayEpisode(episode)}
                      >
                        {/* Episode Thumbnail */}
                        <div className="w-full md:w-48 h-28 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={episode.info?.movie_image || series.cover || '/placeholder-episode.jpg'}
                            alt={`Episode ${episode.episode_num}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        
                        {/* Episode Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              {episode.episode_num}. {episode.title || `Episode ${episode.episode_num}`}
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              {episode.info?.duration ? `${episode.info.duration} min` : ''}
                            </div>
                          </div>
                          
                          {episode.info?.plot && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {episode.info.plot}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No episodes available</p>
              </div>
            )}
          </div>
          
          {/* Similar Series */}
          {similarSeries.length > 0 && (
            <div className="mt-12 space-y-4">
              <h2 className="text-xl font-semibold">Similar Series</h2>
              <ContentGrid
                columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
                gap="medium"
              >
                {similarSeries.slice(0, 10).map((series) => (
                  <ContentCard
                    key={series.id}
                    id={series.id}
                    title={series.name}
                    posterUrl={series.poster_path ? getImageUrl(series.poster_path) : ''}
                    type="series"
                    year={series.first_air_date?.substring(0, 4)}
                    rating={(series.vote_average / 2).toFixed(1)}
                    onClick={() => window.open(`https://www.themoviedb.org/tv/${series.id}`, '_blank')}
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