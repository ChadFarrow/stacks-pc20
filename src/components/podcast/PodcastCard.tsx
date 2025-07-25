/**
 * Podcast Card Component
 *
 * A reusable card component for displaying podcast information
 * with support for PC 2.0 features.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lock, DollarSign } from 'lucide-react';
import type { Podcast } from '@/lib/pc20-types';

interface PodcastCardProps {
  podcast: Podcast;
  onSelect?: (podcast: Podcast) => void;
  showDetails?: boolean;
  className?: string;
}

export function PodcastCard({
  podcast,
  onSelect,
  showDetails = false,
  className
}: PodcastCardProps) {
  const handleClick = () => {
    onSelect?.(podcast);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={podcast.image || podcast.artwork} alt={podcast.title} />
            <AvatarFallback>{getInitials(podcast.title)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2 leading-tight">
              {podcast.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {podcast.author || podcast.ownerName}
            </CardDescription>
          </div>
        </div>

        {/* PC 2.0 Features */}
        <div className="flex flex-wrap gap-1 mt-2">
          {podcast.locked === 1 && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
          {podcast.value && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              Value4Value
            </Badge>
          )}
          {podcast.funding && podcast.funding.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              Funding
            </Badge>
          )}
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {podcast.description}
          </p>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Language:</span>
              <span>{podcast.language || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{formatDate(podcast.lastUpdateTime)}</span>
            </div>
            {podcast.itunesId && (
              <div className="flex justify-between">
                <span>iTunes ID:</span>
                <span>{podcast.itunesId}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {onSelect && (
              <Button onClick={handleClick} size="sm" className="flex-1">
                View Episodes
              </Button>
            )}
            {podcast.link && (
              <Button variant="outline" size="sm" asChild>
                <a href={podcast.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Podcast Grid Component
 *
 * Displays a grid of podcast cards
 */
interface PodcastGridProps {
  podcasts: Podcast[];
  onSelectPodcast?: (podcast: Podcast) => void;
  showDetails?: boolean;
  className?: string;
}

export function PodcastGrid({
  podcasts,
  onSelectPodcast,
  showDetails = false,
  className
}: PodcastGridProps) {
  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No podcasts found
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {podcasts.map((podcast) => (
        <PodcastCard
          key={podcast.id}
          podcast={podcast}
          onSelect={onSelectPodcast}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
}