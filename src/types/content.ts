// Common types
export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

// Live TV types
export interface LiveCategory extends Category {}

export interface LiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface EPGInfo {
  id: string;
  title: string;
  description: string;
  start: string; // ISO date string
  end: string; // ISO date string
  channel: string;
}

export interface EPGProgram {
  id: string;
  start: string;
  stop: string;
  title: string;
  description: string;
  category: string;
}

// Movies types
export interface MovieCategory extends Category {}

export interface Movie {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  rating: string;
  year: string;
  genre: string;
  plot: string;
  cast: string;
  director: string;
  duration: string;
  backdrop_path: string[];
  youtube_trailer: string;
}

// Series types
export interface SeriesCategory extends Category {}

export interface Series {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  release_date: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface Season {
  air_date: string;
  episode_count: string;
  id: string;
  name: string;
  overview: string;
  season_number: string;
  cover: string;
}

export interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    tmdb_id: string;
    releasedate: string;
    plot: string;
    duration_secs: number;
    duration: string;
    movie_image: string;
    bitrate: number;
    rating: string;
    season: number;
  };
  added: string;
  season: number;
  direct_source: string;
}

// TMDB types for enrichment
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime: number;
  credits?: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  credits?: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string;
}

// Player types
export interface PlaybackInfo {
  type: 'live' | 'movie' | 'series';
  id: number;
  title: string;
  streamUrl: string;
  position?: number; // For resuming playback
  episodeInfo?: {
    seriesId: number;
    seasonNumber: number;
    episodeNumber: number;
  };
}