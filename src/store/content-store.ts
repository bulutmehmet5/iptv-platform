import { create } from 'zustand';
import { 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series,
  PlaybackInfo
} from '@/types/content';

interface ContentState {
  // Live TV
  liveCategories: LiveCategory[];
  liveStreams: Record<string, LiveStream[]>; // categoryId -> streams
  selectedLiveCategory: string | null;
  
  // Movies
  movieCategories: MovieCategory[];
  movies: Record<string, Movie[]>; // categoryId -> movies
  selectedMovieCategory: string | null;
  
  // Series
  seriesCategories: SeriesCategory[];
  seriesList: Record<string, Series[]>; // categoryId -> series
  selectedSeriesCategory: string | null;
  
  // Current playback
  currentPlayback: PlaybackInfo | null;
  
  // History
  recentlyWatched: PlaybackInfo[];
  
  // Favorites
  favoriteLiveStreams: number[];
  favoriteMovies: number[];
  favoriteSeries: number[];
  
  // Actions
  setLiveCategories: (categories: LiveCategory[]) => void;
  setLiveStreams: (categoryId: string, streams: LiveStream[]) => void;
  setSelectedLiveCategory: (categoryId: string | null) => void;
  
  setMovieCategories: (categories: MovieCategory[]) => void;
  setMovies: (categoryId: string, movies: Movie[]) => void;
  setSelectedMovieCategory: (categoryId: string | null) => void;
  
  setSeriesCategories: (categories: SeriesCategory[]) => void;
  setSeries: (categoryId: string, series: Series[]) => void;
  setSelectedSeriesCategory: (categoryId: string | null) => void;
  
  setCurrentPlayback: (playback: PlaybackInfo | null) => void;
  
  addToRecentlyWatched: (playback: PlaybackInfo) => void;
  
  toggleFavoriteLiveStream: (streamId: number) => void;
  toggleFavoriteMovie: (movieId: number) => void;
  toggleFavoriteSeries: (seriesId: number) => void;
  
  isLiveStreamFavorite: (streamId: number) => boolean;
  isMovieFavorite: (movieId: number) => boolean;
  isSeriesFavorite: (seriesId: number) => boolean;
}

export const useContentStore = create<ContentState>()((set, get) => ({
  // Live TV
  liveCategories: [],
  liveStreams: {},
  selectedLiveCategory: null,
  
  // Movies
  movieCategories: [],
  movies: {},
  selectedMovieCategory: null,
  
  // Series
  seriesCategories: [],
  seriesList: {},
  selectedSeriesCategory: null,
  
  // Current playback
  currentPlayback: null,
  
  // History
  recentlyWatched: [],
  
  // Favorites
  favoriteLiveStreams: [],
  favoriteMovies: [],
  favoriteSeries: [],
  
  // Actions
  setLiveCategories: (categories) => set({ liveCategories: categories }),
  
  setLiveStreams: (categoryId, streams) => set((state) => ({
    liveStreams: {
      ...state.liveStreams,
      [categoryId]: streams,
    },
  })),
  
  setSelectedLiveCategory: (categoryId) => set({ selectedLiveCategory: categoryId }),
  
  setMovieCategories: (categories) => set({ movieCategories: categories }),
  
  setMovies: (categoryId, movies) => set((state) => ({
    movies: {
      ...state.movies,
      [categoryId]: movies,
    },
  })),
  
  setSelectedMovieCategory: (categoryId) => set({ selectedMovieCategory: categoryId }),
  
  setSeriesCategories: (categories) => set({ seriesCategories: categories }),
  
  setSeries: (categoryId, series) => set((state) => ({
    seriesList: {
      ...state.seriesList,
      [categoryId]: series,
    },
  })),
  
  setSelectedSeriesCategory: (categoryId) => set({ selectedSeriesCategory: categoryId }),
  
  setCurrentPlayback: (playback) => set({ currentPlayback: playback }),
  
  addToRecentlyWatched: (playback) => set((state) => {
    // Remove if already exists (to avoid duplicates)
    const filtered = state.recentlyWatched.filter((item) => {
      if (item.type !== playback.type) return true;
      if (item.type === 'live' && item.id === playback.id) return false;
      if (item.type === 'movie' && item.id === playback.id) return false;
      if (item.type === 'series' && 
          item.episodeInfo?.seriesId === playback.episodeInfo?.seriesId &&
          item.episodeInfo?.seasonNumber === playback.episodeInfo?.seasonNumber &&
          item.episodeInfo?.episodeNumber === playback.episodeInfo?.episodeNumber) {
        return false;
      }
      return true;
    });
    
    // Add to the beginning of the array (most recent first)
    return {
      recentlyWatched: [playback, ...filtered].slice(0, 20), // Keep only the 20 most recent
    };
  }),
  
  toggleFavoriteLiveStream: (streamId) => set((state) => {
    const isFavorite = state.favoriteLiveStreams.includes(streamId);
    return {
      favoriteLiveStreams: isFavorite
        ? state.favoriteLiveStreams.filter((id) => id !== streamId)
        : [...state.favoriteLiveStreams, streamId],
    };
  }),
  
  toggleFavoriteMovie: (movieId) => set((state) => {
    const isFavorite = state.favoriteMovies.includes(movieId);
    return {
      favoriteMovies: isFavorite
        ? state.favoriteMovies.filter((id) => id !== movieId)
        : [...state.favoriteMovies, movieId],
    };
  }),
  
  toggleFavoriteSeries: (seriesId) => set((state) => {
    const isFavorite = state.favoriteSeries.includes(seriesId);
    return {
      favoriteSeries: isFavorite
        ? state.favoriteSeries.filter((id) => id !== seriesId)
        : [...state.favoriteSeries, seriesId],
    };
  }),
  
  isLiveStreamFavorite: (streamId) => get().favoriteLiveStreams.includes(streamId),
  isMovieFavorite: (movieId) => get().favoriteMovies.includes(movieId),
  isSeriesFavorite: (seriesId) => get().favoriteSeries.includes(seriesId),
}));