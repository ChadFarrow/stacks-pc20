/**
 * Enhanced RSS Parser Demo Component
 *
 * Demonstrates the advanced RSS parsing features including:
 * - Batch processing
 * - Publisher feed aggregation
 * - Enhanced error handling
 * - Duration format conversion
 * - Multiple cover art fallbacks
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Music, Radio, Package, Info } from 'lucide-react';
import {
  RSSParser,
  parseAlbumFeed,
  parseMultipleFeeds,
  type RSSAlbum,
  type RSSPublisherItem
} from '@/lib/rssParser';

export function EnhancedRSSDemo() {
  const [singleFeedUrl, setSingleFeedUrl] = useState('');
  const [batchFeedUrls, setBatchFeedUrls] = useState('');
  const [publisherFeedUrl, setPublisherFeedUrl] = useState('');

  const [singleResult, setSingleResult] = useState<RSSAlbum | null>(null);
  const [batchResults, setBatchResults] = useState<RSSAlbum[]>([]);
  const [publisherItems, setPublisherItems] = useState<RSSPublisherItem[]>([]);
  const [publisherAlbums, setPublisherAlbums] = useState<RSSAlbum[]>([]);

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSingleFeedParse = async () => {
    if (!singleFeedUrl.trim()) return;

    setLoading('single');
    setError(null);

    try {
      console.log('🔍 Parsing single RSS feed with enhanced features...');
      const result = await parseAlbumFeed(singleFeedUrl.trim());
      setSingleResult(result);

      if (result) {
        console.log('✅ Enhanced parsing features demonstrated:');
        console.log('- Multiple cover art fallback methods');
        console.log('- Duration format conversion:', result.tracks.map(t => t.duration));
        console.log('- HTML content cleaning in descriptions');
        console.log('- Enhanced error handling with retries');
      }
    } catch (err) {
      setError(`Failed to parse single feed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleBatchParse = async () => {
    const urls = batchFeedUrls.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) return;

    setLoading('batch');
    setError(null);

    try {
      console.log(`🔄 Batch processing ${urls.length} RSS feeds with optimized performance...`);
      const results = await parseMultipleFeeds(urls);
      setBatchResults(results);

      console.log('✅ Batch processing features demonstrated:');
      console.log(`- Processed ${urls.length} feeds in optimized batches`);
      console.log(`- Successfully parsed ${results.length} albums`);
      console.log('- Exponential backoff retry logic');
      console.log('- Parallel processing with rate limiting');
    } catch (err) {
      setError(`Failed to batch parse feeds: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  const handlePublisherParse = async () => {
    if (!publisherFeedUrl.trim()) return;

    setLoading('publisher');
    setError(null);

    try {
      console.log('🏢 Parsing publisher feed for aggregated content...');

      // First get the publisher items
      const items = await RSSParser.parsePublisherFeed(publisherFeedUrl.trim());
      setPublisherItems(items);

      if (items.length > 0) {
        console.log(`📦 Found ${items.length} music items in publisher feed`);

        // Then get all albums from those items
        const albums = await RSSParser.parsePublisherFeedAlbums(publisherFeedUrl.trim());
        setPublisherAlbums(albums);

        console.log('✅ Publisher aggregation features demonstrated:');
        console.log(`- Extracted ${items.length} remote music items`);
        console.log(`- Aggregated ${albums.length} albums from publisher`);
        console.log('- Optimized batch processing for large collections');
        console.log('- Publisher-specific feed handling');
      }
    } catch (err) {
      setError(`Failed to parse publisher feed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  const demoFeatures = [
    {
      title: 'Batch Processing',
      description: 'Process multiple RSS feeds in optimized batches with parallel execution and rate limiting',
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'Cover Art Fallbacks',
      description: 'Multiple fallback methods for extracting cover art from various RSS feed formats',
      icon: <Music className="w-5 h-5" />
    },
    {
      title: 'Duration Conversion',
      description: 'Automatic conversion from HH:MM:SS to MM:SS format with validation',
      icon: <Info className="w-5 h-5" />
    },
    {
      title: 'Publisher Aggregation',
      description: 'Parse publisher feeds to aggregate multiple music feeds from a single source',
      icon: <Radio className="w-5 h-5" />
    },
    {
      title: 'Enhanced Error Handling',
      description: 'Retry logic with exponential backoff and detailed error classification',
      icon: <Info className="w-5 h-5" />
    },
    {
      title: 'HTML Content Cleaning',
      description: 'Automatic cleaning of HTML tags and entity decoding in descriptions',
      icon: <Info className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-6 h-6" />
            Enhanced RSS Parser Demo
          </CardTitle>
          <CardDescription>
            Demonstrates advanced RSS parsing features from the FUCKIT project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                {feature.icon}
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Feed</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="publisher">Publisher Aggregation</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single Feed Parsing</CardTitle>
              <CardDescription>
                Parse a single RSS feed with enhanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter RSS feed URL..."
                  value={singleFeedUrl}
                  onChange={(e) => setSingleFeedUrl(e.target.value)}
                />
                <Button
                  onClick={handleSingleFeedParse}
                  disabled={loading === 'single' || !singleFeedUrl.trim()}
                >
                  {loading === 'single' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Parse'
                  )}
                </Button>
              </div>

              {singleResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {singleResult.coverArt && (
                      <img
                        src={singleResult.coverArt}
                        alt={singleResult.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{singleResult.title}</h3>
                      <p className="text-sm text-muted-foreground">{singleResult.artist}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{singleResult.tracks.length} tracks</Badge>
                        {singleResult.funding && (
                          <Badge variant="secondary">Funding</Badge>
                        )}
                        {singleResult.explicit && (
                          <Badge variant="destructive">Explicit</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p><strong>Enhanced Features Detected:</strong></p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      <li>Cover art extracted using fallback methods</li>
                      <li>Duration formats normalized: {singleResult.tracks.slice(0, 3).map(t => t.duration).join(', ')}</li>
                      <li>HTML content cleaned in descriptions</li>
                      {singleResult.funding && <li>Funding information parsed</li>}
                      {singleResult.keywords && <li>Keywords extracted: {singleResult.keywords.slice(0, 3).join(', ')}</li>}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>
                Process multiple RSS feeds with optimized performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">RSS Feed URLs (one per line)</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-md resize-none"
                  placeholder="https://example.com/feed1.xml&#10;https://example.com/feed2.xml&#10;https://example.com/feed3.xml"
                  value={batchFeedUrls}
                  onChange={(e) => setBatchFeedUrls(e.target.value)}
                />
              </div>

              <Button
                onClick={handleBatchParse}
                disabled={loading === 'batch' || !batchFeedUrls.trim()}
                className="w-full"
              >
                {loading === 'batch' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing Batch...
                  </>
                ) : (
                  'Process Batch'
                )}
              </Button>

              {batchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Batch Results</h3>
                    <Badge variant="secondary">{batchResults.length} albums</Badge>
                  </div>

                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {batchResults.slice(0, 10).map((album, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 border rounded">
                        {album.coverArt && (
                          <img
                            src={album.coverArt}
                            alt={album.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{album.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {album.tracks.length} tracks
                        </Badge>
                      </div>
                    ))}
                    {batchResults.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ... and {batchResults.length - 10} more albums
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publisher" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publisher Feed Aggregation</CardTitle>
              <CardDescription>
                Parse publisher feeds to aggregate multiple music feeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter publisher feed URL..."
                  value={publisherFeedUrl}
                  onChange={(e) => setPublisherFeedUrl(e.target.value)}
                />
                <Button
                  onClick={handlePublisherParse}
                  disabled={loading === 'publisher' || !publisherFeedUrl.trim()}
                >
                  {loading === 'publisher' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Parse'
                  )}
                </Button>
              </div>

              {publisherItems.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Publisher Items Found</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {publisherItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                          <span className="truncate">{item.title || `Item ${index + 1}`}</span>
                          <Badge variant="outline">{item.medium}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {publisherAlbums.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Aggregated Albums</h3>
                      <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {publisherAlbums.slice(0, 8).map((album, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border rounded">
                            {album.coverArt && (
                              <img
                                src={album.coverArt}
                                alt={album.title}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{album.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {album.tracks.length} tracks
                            </Badge>
                          </div>
                        ))}
                        {publisherAlbums.length > 8 && (
                          <p className="text-sm text-muted-foreground text-center">
                            ... and {publisherAlbums.length - 8} more albums
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}