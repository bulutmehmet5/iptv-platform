import axios from 'axios';
import { 
  AuthResponse, 
  XtreamCredentials 
} from '@/types/auth';
import { 
  LiveCategory, 
  LiveStream, 
  MovieCategory, 
  Movie, 
  SeriesCategory, 
  Series, 
  Season, 
  Episode 
} from '@/types/content';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authenticate with Xtream Codes API
 */
export const authenticate = async (credentials: XtreamCredentials): Promise<AuthResponse> => {
  try {
    // Normalize server URL (remove trailing slash if present)
    const serverUrl = credentials.server.endsWith('/') 
      ? credentials.server.slice(0, -1) 
      : credentials.server;
    
    console.log('Authenticating with server:', serverUrl);
    
    // Use our proxy API to avoid CORS issues
    const response = await apiClient.post('/api/xtream', {
      url: `${serverUrl}/player_api.php`,
      params: {
        username: credentials.username,
        password: credentials.password,
      },
    });
    
    console.log('Authentication response received');
    
    if (!response.data || !response.data.user_info) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from IPTV service');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    }
    
    throw new Error('Failed to authenticate with the IPTV service. Please check your credentials and server URL.');
  }
};

/**
 * Base function to make authenticated API calls
 */
const makeAuthenticatedRequest = async <T>(
  serverUrl: string,
  username: string,
  password: string,
  action: string,
  additionalParams = {}
): Promise<T> => {
  try {
    console.log(`Making API request: ${action}`, { serverUrl, additionalParams });
    
    // Use our proxy API to avoid CORS issues
    const response = await apiClient.post('/api/xtream', {
      url: `${serverUrl}/player_api.php`,
      params: {
        username,
        password,
        action,
        ...additionalParams,
      },
    });
    
    console.log(`API response for ${action} received`);
    
    return response.data;
  } catch (error: any) {
    console.error(`API request error (${action}):`, error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('Error request (no response received):', error.request);
    }
    
    throw new Error(`Failed to fetch data from IPTV service: ${action}`);
  }
};

/**
 * Get live stream categories
 */
export const getLiveCategories = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<LiveCategory[]> => {
  return makeAuthenticatedRequest<LiveCategory[]>(
    serverUrl,
    username,
    password,
    'get_live_categories'
  );
};

/**
 * Get live streams by category
 */
export const getLiveStreamsByCategory = async (
  serverUrl: string,
  username: string,
  password: string,
  categoryId: string
): Promise<LiveStream[]> => {
  return makeAuthenticatedRequest<LiveStream[]>(
    serverUrl,
    username,
    password,
    'get_live_streams',
    { category_id: categoryId }
  );
};

/**
 * Get all live streams
 */
export const getAllLiveStreams = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<LiveStream[]> => {
  return makeAuthenticatedRequest<LiveStream[]>(
    serverUrl,
    username,
    password,
    'get_live_streams'
  );
};

/**
 * Get EPG for a specific stream
 */
export const getEPG = async (
  serverUrl: string,
  username: string,
  password: string,
  streamId: number
): Promise<any> => {
  return makeAuthenticatedRequest<any>(
    serverUrl,
    username,
    password,
    'get_short_epg',
    { stream_id: streamId }
  );
};

/**
 * Get movie categories
 */
export const getMovieCategories = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<MovieCategory[]> => {
  return makeAuthenticatedRequest<MovieCategory[]>(
    serverUrl,
    username,
    password,
    'get_vod_categories'
  );
};

/**
 * Get movies by category
 */
export const getMoviesByCategory = async (
  serverUrl: string,
  username: string,
  password: string,
  categoryId: string
): Promise<Movie[]> => {
  return makeAuthenticatedRequest<Movie[]>(
    serverUrl,
    username,
    password,
    'get_vod_streams',
    { category_id: categoryId }
  );
};

/**
 * Get all movies
 */
export const getAllMovies = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<Movie[]> => {
  return makeAuthenticatedRequest<Movie[]>(
    serverUrl,
    username,
    password,
    'get_vod_streams'
  );
};

/**
 * Get movie info
 */
export const getMovieInfo = async (
  serverUrl: string,
  username: string,
  password: string,
  movieId: number
): Promise<Movie> => {
  return makeAuthenticatedRequest<Movie>(
    serverUrl,
    username,
    password,
    'get_vod_info',
    { vod_id: movieId }
  );
};

/**
 * Get series categories
 */
export const getSeriesCategories = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<SeriesCategory[]> => {
  return makeAuthenticatedRequest<SeriesCategory[]>(
    serverUrl,
    username,
    password,
    'get_series_categories'
  );
};

/**
 * Get series by category
 */
export const getSeriesByCategory = async (
  serverUrl: string,
  username: string,
  password: string,
  categoryId: string
): Promise<Series[]> => {
  return makeAuthenticatedRequest<Series[]>(
    serverUrl,
    username,
    password,
    'get_series',
    { category_id: categoryId }
  );
};

/**
 * Get all series
 */
export const getAllSeries = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<Series[]> => {
  return makeAuthenticatedRequest<Series[]>(
    serverUrl,
    username,
    password,
    'get_series'
  );
};

/**
 * Get series info
 */
export const getSeriesInfo = async (
  serverUrl: string,
  username: string,
  password: string,
  seriesId: number
): Promise<{ info: Series; episodes: Record<string, Episode[]> }> => {
  return makeAuthenticatedRequest<{ info: Series; episodes: Record<string, Episode[]> }>(
    serverUrl,
    username,
    password,
    'get_series_info',
    { series_id: seriesId }
  );
};

/**
 * Get stream URL for live TV
 */
export const getLiveStreamUrl = (
  serverUrl: string,
  username: string,
  password: string,
  streamId: number
): string => {
  const directUrl = `${serverUrl}/live/${username}/${password}/${streamId}.ts`;
  // Use our media proxy API to avoid CORS issues
  return `/api/media?url=${encodeURIComponent(directUrl)}`;
};

/**
 * Get stream URL for movie
 */
export const getMovieStreamUrl = (
  serverUrl: string,
  username: string,
  password: string,
  streamId: number,
  extension = 'mp4'
): string => {
  const directUrl = `${serverUrl}/movie/${username}/${password}/${streamId}.${extension}`;
  // Use our media proxy API to avoid CORS issues
  return `/api/media?url=${encodeURIComponent(directUrl)}`;
};

/**
 * Get stream URL for series episode
 */
export const getEpisodeStreamUrl = (
  serverUrl: string,
  username: string,
  password: string,
  streamId: number,
  extension = 'mp4'
): string => {
  const directUrl = `${serverUrl}/series/${username}/${password}/${streamId}.${extension}`;
  // Use our media proxy API to avoid CORS issues
  return `/api/media?url=${encodeURIComponent(directUrl)}`;
};