import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { useContentStore } from '@/store/content-store';
import { useSettingsStore } from '@/store/settings-store';
import { PlaybackInfo } from '@/types/content';

interface UsePlayerProps {
  playbackInfo: PlaybackInfo | null;
  autoPlay?: boolean;
}

export const usePlayer = ({ playbackInfo, autoPlay = true }: UsePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const { addToRecentlyWatched } = useContentStore();
  const { bufferSize } = useSettingsStore();
  
  // Initialize player when playbackInfo changes
  useEffect(() => {
    if (!playbackInfo || !videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    const videoElement = videoRef.current;
    
    // Cleanup previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Check if the stream URL is an HLS stream
    const isHlsStream = playbackInfo.streamUrl.includes('.m3u8');
    
    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: bufferSize,
        maxMaxBufferLength: bufferSize * 2,
      });
      
      hls.loadSource(playbackInfo.streamUrl);
      hls.attachMedia(videoElement);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          videoElement.play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.error('Failed to autoplay:', err);
              setIsPlaying(false);
            });
        }
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error:', data);
              setError('Network error. Please check your connection.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error:', data);
              setError('Media error. Trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error:', data);
              setError('Fatal error. Please try again later.');
              hls.destroy();
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } else {
      // For non-HLS streams or browsers that don't support HLS.js
      videoElement.src = playbackInfo.streamUrl;
      
      videoElement.oncanplay = () => {
        setIsLoading(false);
        if (autoPlay) {
          videoElement.play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.error('Failed to autoplay:', err);
              setIsPlaying(false);
            });
        }
      };
      
      videoElement.onerror = () => {
        console.error('Video error:', videoElement.error);
        setError('Failed to load video. Please try again later.');
        setIsLoading(false);
      };
    }
    
    // Set initial position if provided
    if (playbackInfo.position && playbackInfo.position > 0) {
      videoElement.currentTime = playbackInfo.position;
    }
    
    // Add to recently watched
    addToRecentlyWatched(playbackInfo);
    
    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      videoElement.src = '';
      videoElement.removeAttribute('src');
    };
  }, [playbackInfo, autoPlay, bufferSize, addToRecentlyWatched]);
  
  // Handle time updates
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);
  
  // Player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play()
        .catch((err) => console.error('Failed to play:', err));
    }
  };
  
  const seek = (time: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = time;
  };
  
  const changeVolume = (newVolume: number) => {
    if (!videoRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    
    // Update volume state to reflect muted state
    setVolume(newMuted ? 0 : videoRef.current.volume);
  };
  
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .catch((err) => console.error('Error exiting fullscreen:', err));
    } else {
      videoRef.current.requestFullscreen()
        .catch((err) => console.error('Error entering fullscreen:', err));
    }
  };
  
  return {
    videoRef,
    isPlaying,
    isLoading,
    error,
    volume,
    currentTime,
    duration,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    toggleFullscreen,
  };
};