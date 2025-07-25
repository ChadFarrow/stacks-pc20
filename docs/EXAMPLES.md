# Implementation Examples

This document provides practical examples of building Podcasting 2.0 features using this starter template.

## Basic Podcast Discovery App

### 1. Simple Search Interface

```typescript
// components/SimplePodcastSearch.tsx
import { useState } from 'react';
import { useSearchPodcasts } from '@/hooks/usePodcastIndex';
import { PodcastGrid } from '@/components/podcast/PodcastCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SimplePodcastSearch({ config }) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useSearchPodcasts(
    { q: searchTerm, max: 20 },
    config
  );

  const handleSearch = () => {
    setSearchTerm(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search for podcasts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
      </div>

      {error && <div className="text-red-500">Error: {error.message}</div>}
      
      {data?.feeds && (
        <PodcastGrid 
          podcasts={data.feeds} 
          showDetails={true}
        />
      )}
    </div>
  );
}
```

### 2. Podcast Detail Page

```typescript
// pages/PodcastDetail.tsx
import { useParams } from 'react-router-dom';
import { usePodcast, useEpisodes } from '@/hooks/usePodcastIndex';
import { EpisodeList } from '@/components/podcast/EpisodeCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PodcastDetail({ config }) {
  const { id } = useParams();
  const podcastId = parseInt(id);

  const { data: podcastData, isLoading: podcastLoading } = usePodcast(podcastId, config);
  const { data: episodesData, isLoading: episodesLoading } = useEpisodes(
    { id: podcastId, max: 50 },
    config
  );

  if (podcastLoading) return <div>Loading podcast...</div>;
  if (!podcastData?.feed) return <div>Podcast not found</div>;

  const podcast = podcastData.feed;

  return (
    <div className="space-y-6">
      {/* Podcast Header */}
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <img 
              src={podcast.image} 
              alt={podcast.title}
              className="w-24 h-24 rounded-lg"
            />
            <div className="flex-1">
              <CardTitle className="text-2xl">{podcast.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{podcast.author}</p>
              
              {/* PC 2.0 Features */}
              <div className="flex gap-2 mt-3">
                {podcast.locked === 1 && <Badge>Locked</Badge>}
                {podcast.value && <Badge>Value4Value</Badge>}
                {podcast.funding?.length > 0 && <Badge>Funding Available</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{podcast.description}</p>
          
          {/* Funding Links */}
          {podcast.funding && podcast.funding.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Support This Podcast</h3>
              <div className="flex gap-2">
                {podcast.funding.map((funding, index) => (
                  <Button key={index} variant="outline" size="sm" asChild>
                    <a href={funding.url} target="_blank" rel="noopener noreferrer">
                      {funding.message}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Episodes */}
      <Card>
        <CardHeader>
          <CardTitle>Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          {episodesLoading ? (
            <div>Loading episodes...</div>
          ) : episodesData?.items ? (
            <EpisodeList 
              episodes={episodesData.items}
              showDetails={true}
            />
          ) : (
            <div>No episodes found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Advanced Features

### 3. Episode Player with Chapters

```typescript
// components/EpisodePlayer.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import type { Episode, Chapter } from '@/lib/pc20-types';

interface EpisodePlayerProps {
  episode: Episode;
}

export function EpisodePlayer({ episode }: EpisodePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // Load chapters if available
  useEffect(() => {
    if (episode.chaptersUrl) {
      fetch(episode.chaptersUrl)
        .then(res => res.json())
        .then(data => {
          setChapters(data.chapters || []);
        })
        .catch(console.error);
    }
  }, [episode.chaptersUrl]);

  // Update current chapter based on time
  useEffect(() => {
    if (chapters.length > 0) {
      const chapter = chapters
        .slice()
        .reverse()
        .find(ch => currentTime >= ch.startTime);
      setCurrentChapter(chapter || null);
    }
  }, [currentTime, chapters]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekToChapter = (chapter: Chapter) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = chapter.startTime;
    setCurrentTime(chapter.startTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={episode.enclosureUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Player Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{episode.title}</CardTitle>
          {currentChapter && (
            <Badge variant="secondary">
              Chapter: {currentChapter.title}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button onClick={togglePlayPause} size="sm">
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button variant="outline" size="sm">
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="flex-1 text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chapters */}
      {chapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    currentChapter === chapter ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => seekToChapter(chapter)}
                >
                  {chapter.img && (
                    <img 
                      src={chapter.img} 
                      alt={chapter.title}
                      className="w-10 h-10 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{chapter.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(chapter.startTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 4. Value4Value Payment Integration

```typescript
// components/ValuePayment.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign } from 'lucide-react';
import type { Episode, ValueDestination } from '@/lib/pc20-types';

interface ValuePaymentProps {
  episode: Episode;
}

export function ValuePayment({ episode }: ValuePaymentProps) {
  const [amount, setAmount] = useState(1000); // sats
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  if (!episode.value) {
    return null;
  }

  const { destinations } = episode.value;

  const sendPayment = async () => {
    setIsPaymentLoading(true);
    
    try {
      // Check if WebLN is available
      if (typeof window !== 'undefined' && 'webln' in window) {
        await window.webln.enable();
        
        // Send payments to each destination based on split
        for (const dest of destinations) {
          const destAmount = Math.floor(amount * (dest.split / 100));
          
          if (destAmount > 0) {
            // Create keysend payment
            await window.webln.keysend({
              destination: dest.address,
              amount: destAmount,
              customRecords: {
                // Add podcast metadata
                7629169: episode.feedTitle, // podcast name
                7629171: episode.title,     // episode title
              }
            });
          }
        }
        
        alert('Payment sent successfully!');
      } else {
        alert('WebLN wallet not found. Please install a Lightning wallet extension.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Support This Episode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Send sats directly to the creators using Lightning Network
        </p>

        {/* Value Splits */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Payment Distribution</h4>
          {destinations.map((dest, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{dest.name}</span>
              <Badge variant="outline">{dest.split}%</Badge>
            </div>
          ))}
        </div>

        {/* Payment Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (sats)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="flex-1"
            />
            <Button
              onClick={sendPayment}
              disabled={isPaymentLoading || amount <= 0}
              className="flex items-center gap-2"
            >
              {isPaymentLoading ? (
                'Sending...'
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {[100, 500, 1000, 5000].map(quickAmount => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => setAmount(quickAmount)}
            >
              {quickAmount}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. RSS Feed Parser Example

```typescript
// utils/feedParser.ts
import { parsePC20Feed, getPC20Features } from '@/lib/rssParser';
import type { PC20Feed } from '@/lib/pc20-types';

export async function analyzePodcastFeed(feedUrl: string) {
  try {
    const feed = await parsePC20Feed(feedUrl);
    const features = getPC20Features(feed);
    
    return {
      feed,
      features,
      isPC20Compatible: features.length > 0,
      analysis: {
        totalEpisodes: feed.items.length,
        hasChapters: feed.items.some(item => item['podcast:chapters']),
        hasTranscripts: feed.items.some(item => item['podcast:transcript']),
        hasValue: !!feed['podcast:value'],
        hasFunding: !!(feed['podcast:funding'] && feed['podcast:funding'].length > 0),
        isLocked: feed['podcast:locked']?._text === true,
      }
    };
  } catch (error) {
    throw new Error(`Failed to analyze feed: ${error.message}`);
  }
}

// Usage example
export function FeedAnalyzer() {
  const [feedUrl, setFeedUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeFeed = async () => {
    if (!feedUrl) return;
    
    setIsLoading(true);
    try {
      const result = await analyzePodcastFeed(feedUrl);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter RSS feed URL..."
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
        />
        <Button onClick={analyzeFeed} disabled={isLoading}>
          Analyze
        </Button>
      </div>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>{analysis.feed.title}</CardTitle>
            <div className="flex gap-2">
              {analysis.features.map(feature => (
                <Badge key={feature} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Episodes: {analysis.analysis.totalEpisodes}</div>
              <div>PC 2.0: {analysis.isPC20Compatible ? 'Yes' : 'No'}</div>
              <div>Chapters: {analysis.analysis.hasChapters ? 'Yes' : 'No'}</div>
              <div>Transcripts: {analysis.analysis.hasTranscripts ? 'Yes' : 'No'}</div>
              <div>Value4Value: {analysis.analysis.hasValue ? 'Yes' : 'No'}</div>
              <div>Locked: {analysis.analysis.isLocked ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Complete App Example

### 6. Main App Structure

```typescript
// App.tsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import { PodcastSearch } from '@/components/podcast/PodcastSearch';
import { PodcastDetail } from '@/pages/PodcastDetail';
import { EpisodePlayer } from '@/components/EpisodePlayer';

const queryClient = new QueryClient();

function App() {
  const [config] = useState({
    apiKey: process.env.REACT_APP_PODCAST_INDEX_API_KEY,
    apiSecret: process.env.REACT_APP_PODCAST_INDEX_API_SECRET,
    userAgent: 'PC20Starter/1.0',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pc20-theme">
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl font-bold">PC 2.0 Podcast App</h1>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route 
                  path="/" 
                  element={<PodcastSearch config={config} />} 
                />
                <Route 
                  path="/podcast/:id" 
                  element={<PodcastDetail config={config} />} 
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

These examples demonstrate how to build a complete Podcasting 2.0 application using the starter template. You can mix and match these components to create your own unique podcast app with modern PC 2.0 features.