'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Clock, Calendar, Users, Tv, Film, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentCard } from '@/components/shared/content-card';
import { ChannelCard } from '@/components/shared/channel-card';
import { ContentGrid } from '@/components/shared/content-grid';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';

export default function ProfilePage() {
  const router = useRouter();
  const { userSession, logout } = useAuthStore();
  const { 
    recentlyWatched,
    favoriteLiveStreams,
    favoriteMovies,
    favoriteSeries,
    liveStreams,
    movies,
    seriesList
  } = useContentStore();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  // Get favorite live streams
  const getFavoriteLiveStreams = () => {
    const favorites: any[] = [];
    
    // Check all categories for favorite streams
    Object.values(liveStreams).forEach(streams => {
      streams.forEach(stream => {
        if (favoriteLiveStreams.includes(stream.stream_id)) {
          favorites.push(stream);
        }
      });
    });
    
    return favorites;
  };
  
  // Get favorite movies
  const getFavoriteMovies = () => {
    const favorites: any[] = [];
    
    // Check all categories for favorite movies
    Object.values(movies).forEach(categoryMovies => {
      categoryMovies.forEach(movie => {
        if (favoriteMovies.includes(movie.stream_id)) {
          favorites.push(movie);
        }
      });
    });
    
    return favorites;
  };
  
  // Get favorite series
  const getFavoriteSeries = () => {
    const favorites: any[] = [];
    
    // Check all categories for favorite series
    Object.values(seriesList).forEach(categorySeries => {
      categorySeries.forEach(series => {
        if (favoriteSeries.includes(series.series_id)) {
          favorites.push(series);
        }
      });
    });
    
    return favorites;
  };
  
  const favoriteStreams = getFavoriteLiveStreams();
  const favoriteMoviesList = getFavoriteMovies();
  const favoriteSeriesList = getFavoriteSeries();
  
  if (!userSession) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and view your content
          </p>
        </div>
        
        <Button 
          variant="destructive" 
          className="gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Username
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userSession.username}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Expires
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {new Date(userSession.expDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {userSession.activeConnections} / {userSession.maxConnections}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Account Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userSession.isTrial ? 'Trial' : 'Regular'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Created: {new Date(userSession.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recently Watched */}
      {recentlyWatched.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Watched
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentlyWatched.slice(0, 4).map((item) => (
              <Card key={`${item.type}-${item.id}`} className="overflow-hidden">
                <div className="aspect-video relative">
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
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  {item.type === 'series' && item.episodeInfo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      S{item.episodeInfo.seasonNumber} E{item.episodeInfo.episodeNumber}
                      {item.episodeInfo.episodeTitle ? `: ${item.episodeInfo.episodeTitle}` : ''}
                    </p>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full mt-3 gap-1"
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
                    <Play className="h-4 w-4" />
                    Continue Watching
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {recentlyWatched.length > 4 && (
            <div className="flex justify-center">
              <Button variant="outline">
                View All History
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Favorites */}
      <div className="space-y-8">
        {/* Favorite Live Channels */}
        {favoriteStreams.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Favorite Channels
            </h2>
            
            <ContentGrid
              columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              gap="medium"
            >
              {favoriteStreams.slice(0, 8).map((stream) => (
                <ChannelCard
                  key={stream.stream_id}
                  id={stream.stream_id}
                  name={stream.name}
                  logoUrl={stream.stream_icon || ''}
                  onClick={() => router.push('/live')}
                />
              ))}
            </ContentGrid>
            
            {favoriteStreams.length > 8 && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push('/live')}>
                  View All Favorite Channels
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Favorite Movies */}
        {favoriteMoviesList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Film className="h-5 w-5" />
              Favorite Movies
            </h2>
            
            <ContentGrid
              columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
              gap="medium"
            >
              {favoriteMoviesList.slice(0, 10).map((movie) => (
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
            
            {favoriteMoviesList.length > 10 && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push('/movies')}>
                  View All Favorite Movies
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Favorite Series */}
        {favoriteSeriesList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clapperboard className="h-5 w-5" />
              Favorite Series
            </h2>
            
            <ContentGrid
              columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
              gap="medium"
            >
              {favoriteSeriesList.slice(0, 10).map((series) => (
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
            
            {favoriteSeriesList.length > 10 && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push('/series')}>
                  View All Favorite Series
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}