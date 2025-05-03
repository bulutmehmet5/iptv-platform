'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CategorySelector } from '@/components/shared/category-selector';
import { ContentGrid } from '@/components/shared/content-grid';
import { ChannelCard } from '@/components/shared/channel-card';
import { VidstackPlayer } from '@/components/player/vidstack-player';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { useContentStore } from '@/store/content-store';
import { getLiveCategories, getLiveStreamsByCategory, getLiveStreamUrl, getEPG } from '@/lib/api/xtream';
import { LiveStream, PlaybackInfo } from '@/types/content';

export default function LivePage() {
  const router = useRouter();
  const { credentials } = useAuthStore();
  const { 
    liveCategories, 
    setLiveCategories,
    liveStreams,
    setLiveStreams,
    selectedLiveCategory,
    setSelectedLiveCategory,
    setCurrentPlayback
  } = useContentStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStreams, setCurrentStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  // Fetch live categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!credentials) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const categories = await getLiveCategories(
          credentials.server,
          credentials.username,
          credentials.password
        );
        
        setLiveCategories(categories);
        
        // Select first category by default if none selected
        if (!selectedLiveCategory && categories.length > 0) {
          setSelectedLiveCategory(categories[0].category_id);
        }
      } catch (err) {
        console.error('Failed to fetch live categories:', err);
        setError('Failed to load live TV categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, [credentials, selectedLiveCategory, setLiveCategories, setSelectedLiveCategory]);
  
  // Fetch streams for selected category
  useEffect(() => {
    const fetchStreams = async () => {
      if (!credentials || !selectedLiveCategory) return;
      
      // Check if we already have streams for this category
      if (liveStreams[selectedLiveCategory]) {
        setCurrentStreams(liveStreams[selectedLiveCategory]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const streams = await getLiveStreamsByCategory(
          credentials.server,
          credentials.username,
          credentials.password,
          selectedLiveCategory
        );
        
        setLiveStreams(selectedLiveCategory, streams);
        setCurrentStreams(streams);
      } catch (err) {
        console.error('Failed to fetch live streams:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStreams();
  }, [credentials, selectedLiveCategory, liveStreams, setLiveStreams]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedLiveCategory(null);
    } else {
      setSelectedLiveCategory(categoryId);
    }
  };
  
  // Handle channel selection
  const handleChannelSelect = (stream: LiveStream) => {
    setSelectedStream(stream);
    setIsPlayerOpen(true);
    
    if (credentials) {
      const streamUrl = getLiveStreamUrl(
        credentials.server,
        credentials.username,
        credentials.password,
        stream.stream_id
      );
      
      const playbackInfo: PlaybackInfo = {
        id: stream.stream_id,
        title: stream.name,
        streamUrl,
        type: 'live',
        thumbnailUrl: stream.stream_icon || '',
      };
      
      setCurrentPlayback(playbackInfo);
    }
  };
  
  // Handle player close
  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setCurrentPlayback(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live TV</h1>
          <p className="text-muted-foreground">
            Watch your favorite channels live
          </p>
        </div>
        
        {liveCategories.length > 0 && (
          <CategorySelector
            categories={liveCategories}
            selectedCategoryId={selectedLiveCategory}
            onSelectCategory={handleCategorySelect}
            className="w-full md:w-auto"
          />
        )}
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {!isLoading && !error && currentStreams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No channels found in this category</p>
        </div>
      )}
      
      {currentStreams.length > 0 && (
        <ContentGrid
          columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          gap="medium"
        >
          {currentStreams.map((stream) => (
            <ChannelCard
              key={stream.stream_id}
              id={stream.stream_id}
              name={stream.name}
              logoUrl={stream.stream_icon || ''}
              onClick={() => handleChannelSelect(stream)}
            />
          ))}
        </ContentGrid>
      )}
      
      {/* Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <DialogTitle className="sr-only">
            {selectedStream ? selectedStream.name : 'Live TV Player'}
          </DialogTitle>
          {selectedStream && credentials && (
            <VidstackPlayer
              playbackInfo={{
                id: selectedStream.stream_id,
                title: selectedStream.name,
                streamUrl: getLiveStreamUrl(
                  credentials.server,
                  credentials.username,
                  credentials.password,
                  selectedStream.stream_id
                ),
                type: 'live',
                thumbnailUrl: selectedStream.stream_icon || '',
              }}
              onClose={handlePlayerClose}
              autoPlay={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}