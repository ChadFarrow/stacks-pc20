/**
 * Episode Card Component
 * 
 * A reusable card component for displaying episode information
 * with support for PC 2.0 features like chapters, transcripts, and soundbites.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, 
  Clock, 
  Calendar, 
  FileText, 
  BookOpen, 
  Volume2, 
  MapPin, 
  Users,
  DollarSign,
  ExternalLink 
} from 'lucide-react';
import type { Episode } from '@/lib/pc20-types';

interface EpisodeCardProps {
  episode: Episode;
  onPlay?: (episode: Episode) => void;
  showDetails?: boolean;
  className?: string;
}

export function EpisodeCard({ 
  episode, 
  onPlay, 
  showDetails = false,
  className 
}: EpisodeCardProps) {
  const handlePlay = () => {
    onPlay?.(episode);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
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
            <AvatarImage src={episode.image || episode.feedImage} alt={episode.title} />
            <AvatarFallback>{getInitials(episode.title)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2 leading-tight">
              {episode.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {episode.feedTitle}
            </CardDescription>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(episode.datePublished)}
              </div>
              {episode.duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(episode.duration)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episode metadata */}
        <div className="flex flex-wrap gap-1 mt-2">
          {episode.episode && (
            <Badge variant="outline" className="text-xs">
              Episode {episode.episode}
            </Badge>
          )}
          {episode.season && (
            <Badge variant="outline" className="text-xs">
              Season {episode.season}
            </Badge>
          )}
          {episode.episodeType && (
            <Badge variant="secondary" className="text-xs">
              {episode.episodeType}
            </Badge>
          )}
          {episode.explicit === 1 && (
            <Badge variant="destructive" className="text-xs">
              Explicit
            </Badge>
          )}
        </div>

        {/* PC 2.0 Features */}
        <div className="flex flex-wrap gap-1 mt-1">
          {episode.chaptersUrl && (
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Chapters
            </Badge>
          )}
          {episode.transcriptUrl && (
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Transcript
            </Badge>
          )}
          {episode.soundbite && episode.soundbite.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Volume2 className="w-3 h-3 mr-1" />
              Soundbites
            </Badge>
          )}
          {episode.persons && episode.persons.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              People
            </Badge>
          )}
          {episode.location && (
            <Badge variant="secondary" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Location
            </Badge>
          )}
          {episode.value && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              Value4Value
            </Badge>
          )}
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {episode.description}
          </p>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>File Type:</span>
              <span>{episode.enclosureType}</span>
            </div>
            {episode.enclosureLength > 0 && (
              <div className="flex justify-between">
                <span>File Size:</span>
                <span>{formatFileSize(episode.enclosureLength)}</span>
              </div>
            )}
            {episode.guid && (
              <div className="flex justify-between">
                <span>GUID:</span>
                <span className="truncate max-w-32">{episode.guid}</span>
              </div>
            )}
          </div>

          {/* PC 2.0 Details */}
          {episode.persons && episode.persons.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">People</h4>
              <div className="flex flex-wrap gap-1">
                {episode.persons.map((person, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {person.name} {person.role && `(${person.role})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {episode.location && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Location</h4>
              <p className="text-xs text-muted-foreground">{episode.location.name}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {onPlay && (
              <Button onClick={handlePlay} size="sm" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
            )}
            {episode.link && (
              <Button variant="outline" size="sm" asChild>
                <a href={episode.link} target="_blank" rel="noopener noreferrer">
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
 * Episode List Component
 * 
 * Displays a list of episode cards
 */
interface EpisodeListProps {
  episodes: Episode[];
  onPlayEpisode?: (episode: Episode) => void;
  showDetails?: boolean;
  className?: string;
}

export function EpisodeList({ 
  episodes, 
  onPlayEpisode, 
  showDetails = false,
  className 
}: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No episodes found
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          onPlay={onPlayEpisode}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
}