'use client';

import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/hooks/use-player';
import { PlaybackInfo } from '@/types/content';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Loader2,
  SkipForward,
  SkipBack,
  X
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  playbackInfo: PlaybackInfo;
  onClose?: () => void;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export function VideoPlayer({
  playbackInfo,
  onClose,
  className,
  autoPlay = true,
  showControls = true,
}: VideoPlayerProps) {
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = usePlayer({ playbackInfo, autoPlay });
  
  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControlsOverlay(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControlsOverlay(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle events if this player is focused
      if (!playerContainerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(volume - 0.1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, toggleFullscreen, toggleMute, seek, currentTime, changeVolume, volume]);
  
  return (
    <div 
      ref={playerContainerRef}
      className={cn(
        "relative w-full aspect-video bg-black overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControlsOverlay(false)}
      tabIndex={0} // Make div focusable for keyboard shortcuts
    >
      {/* Video element */}
      <video 
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={togglePlay}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
          <div className="text-destructive text-xl font-semibold mb-2">Error</div>
          <div className="text-white text-center">{error}</div>
          {onClose && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onClose}
            >
              Close Player
            </Button>
          )}
        </div>
      )}
      
      {/* Controls overlay */}
      {showControls && (showControlsOverlay || !isPlaying) && (
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 p-4">
          {/* Top controls */}
          <div className="flex justify-between items-center">
            <div className="text-white font-medium truncate">
              {playbackInfo.title}
            </div>
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Center play/pause button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-16 w-16 rounded-full bg-black/30 text-white hover:bg-black/50 pointer-events-auto"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          {/* Bottom controls */}
          <div className="space-y-2">
            {/* Progress bar */}
            {duration > 0 && (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-white">
                  {formatTime(currentTime)}
                </div>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration}
                  step={1}
                  onValueChange={(value) => seek(value[0])}
                  className="flex-1"
                />
                <div className="text-xs text-white">
                  {formatTime(duration)}
                </div>
              </div>
            )}
            
            {/* Control buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                {duration > 0 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20"
                      onClick={() => seek(currentTime - 10)}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20"
                      onClick={() => seek(currentTime + 10)}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                <div className="flex items-center space-x-2 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Slider
                    value={[volume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => changeVolume(value[0] / 100)}
                    className="w-24"
                  />
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}