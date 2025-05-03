import axios from 'axios';
import { TMDBMovie, TMDBSeries } from '@/types/content';

// TMDB API configuration
const TMDB_API_KEY = '42125c682636b68d10d70b487c692685';
const TMDB_API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjEyNWM2ODI2MzZiNjhkMTBkNzBiNDg3YzY5MjY4NSIsIm5iZiI6MS42NDM4MjA2NjA2OTUwMDAyZSs5LCJzdWIiOiI2MWZhYjY3NGI3YWJiNTAwNjY1YWQ4MzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e06dzH5trScMiz7obFbCFip5dO1XQp-bUC3lecJ8sxU';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance with default config
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TMDB_API_TOKEN}`,
  },
});

/**
 * Search for a movie by title
 */
export const searchMovie = async (query: string): Promise<TMDBMovie[]> => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: {
        query,
        include_adult: false,
        language: 'en-US',
        page: 1,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('TMDB search movie error:', error);
    throw new Error('Failed to search for movie on TMDB');
  }
};

/**
 * Get movie details by TMDB ID
 */
export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits',
        language: 'en-US',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('TMDB get movie details error:', error);
    throw new Error('Failed to get movie details from TMDB');
  }
};

/**
 * Search for a TV series by title
 */
export const searchTVSeries = async (query: string): Promise<TMDBSeries[]> => {
  try {
    const response = await tmdbClient.get('/search/tv', {
      params: {
        query,
        include_adult: false,
        language: 'en-US',
        page: 1,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('TMDB search TV series error:', error);
    throw new Error('Failed to search for TV series on TMDB');
  }
};

/**
 * Get TV series details by TMDB ID
 */
export const getTVSeriesDetails = async (seriesId: number): Promise<TMDBSeries> => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}`, {
      params: {
        append_to_response: 'credits',
        language: 'en-US',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('TMDB get TV series details error:', error);
    throw new Error('Failed to get TV series details from TMDB');
  }
};

/**
 * Get similar movies
 */
export const getSimilarMovies = async (movieId: number): Promise<TMDBMovie[]> => {
  try {
    const response = await tmdbClient.get(`/movie/${movieId}/similar`, {
      params: {
        language: 'en-US',
        page: 1,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('TMDB get similar movies error:', error);
    throw new Error('Failed to get similar movies from TMDB');
  }
};

/**
 * Get similar TV series
 */
export const getSimilarTVSeries = async (seriesId: number): Promise<TMDBSeries[]> => {
  try {
    const response = await tmdbClient.get(`/tv/${seriesId}/similar`, {
      params: {
        language: 'en-US',
        page: 1,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('TMDB get similar TV series error:', error);
    throw new Error('Failed to get similar TV series from TMDB');
  }
};

/**
 * Get image URL with specified size
 */
export const getImageUrl = (path: string, size: 'original' | 'w500' | 'w300' | 'w185' = 'w500'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};