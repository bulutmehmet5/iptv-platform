"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { PlaybackInfo } from "@/types/player";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VidstackPlayerProps {
  playbackInfo: PlaybackInfo;
  onClose?: () => void;
  autoPlay?: boolean;
}

export function VidstackPlayer({
  playbackInfo,
  onClose,
  autoPlay = true,
}: VidstackPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance if it exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if the stream URL is valid
    if (!playbackInfo.streamUrl) {
      console.error("Stream URL is missing");
      return;
    }

    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(playbackInfo.streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(err => {
            console.error("Error playing video:", err);
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              hls.destroy();
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } 
    // For browsers that natively support HLS (Safari)
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackInfo.streamUrl;
      if (autoPlay) {
        video.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
    } else {
      console.error("HLS is not supported in this browser");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackInfo.streamUrl, autoPlay]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-50 text-white bg-black/50 hover:bg-black/70"
          onClick={onClose}
          aria-label="Close player"
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        poster={playbackInfo.thumbnailUrl}
        title={playbackInfo.title}
      />
    </div>
  );
}