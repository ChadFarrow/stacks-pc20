/**
 * Podcast Search Component
 * 
 * A comprehensive search interface for finding podcasts using the Podcast Index API
 * with support for different search types and filters.
 */

import { useState } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSearchPodcasts } from '@/hooks/usePodcastIndex';
import { PodcastGrid } from './PodcastCard';
import type { PodcastIndexConfig, Podcast, SearchPodcastsParams } from '@/lib/pc20-types';

interface PodcastSearchProps {
  config?: PodcastIndexConfig;
  onSelectPodcast?: (podcast: Podcast) => void;
  className?: string;
}

export function PodcastSearch({ config, onSelectPodcast, className }: PodcastSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<SearchPodcastsParams>({
    q: '',
    max: 20,
    clean: true,
    fulltext: false,
    similar: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useSearchPodcasts(searchParams, config);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearchParams(prev => ({
      ...prev,
      q: searchQuery.trim(),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const updateSearchParam = <K extends keyof SearchPodcastsParams>(
    key: K,
    value: SearchPodcastsParams[K]
  ) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!config) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Podcast Search</CardTitle>
          <CardDescription>
            Podcast Index API configuration required. Get your API key at{' '}
            <a 
              href="https://api.podcastindex.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              api.podcastindex.org
            </a>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Podcasts
          </CardTitle>
          <CardDescription>
            Search the Podcast Index database for podcasts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter podcast name, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-results">Max Results</Label>
                  <Select
                    value={searchParams.max?.toString()}
                    onValueChange={(value) => updateSearchParam('max', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value-filter">Value Filter</Label>
                  <Select
                    value={searchParams.val || ''}
                    onValueChange={(value) => updateSearchParam('val', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="lightning">Lightning</SelectItem>
                      <SelectItem value="webmonetization">Web Monetization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="clean-search"
                    checked={searchParams.clean}
                    onCheckedChange={(checked) => updateSearchParam('clean', checked)}
                  />
                  <Label htmlFor="clean-search">Clean results (remove explicit content)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="fulltext-search"
                    checked={searchParams.fulltext}
                    onCheckedChange={(checked) => updateSearchParam('fulltext', checked)}
                  />
                  <Label htmlFor="fulltext-search">Full-text search (search descriptions)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="similar-search"
                    checked={searchParams.similar}
                    onCheckedChange={(checked) => updateSearchParam('similar', checked)}
                  />
                  <Label htmlFor="similar-search">Include similar results</Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Search Results */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error searching podcasts: {error.message}
            </p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {data.count || data.feeds?.length || 0} podcasts
                  {searchParams.q && ` for "${searchParams.q}"`}
                </CardDescription>
              </div>
              {data.feeds && data.feeds.length > 0 && (
                <Badge variant="secondary">
                  {data.feeds.length} results
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.feeds && data.feeds.length > 0 ? (
              <PodcastGrid
                podcasts={data.feeds}
                onSelectPodcast={onSelectPodcast}
                showDetails={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchParams.q ? 'No podcasts found for your search.' : 'Enter a search term to find podcasts.'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Searching podcasts...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}