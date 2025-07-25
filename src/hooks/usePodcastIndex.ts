/**
 * React Hook for Podcast Index API
 *
 * Provides easy access to Podcast Index API with React Query integration
 * for caching, loading states, and error handling.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPodcastIndexClient } from '@/lib/podcastIndex';
import type {
  PodcastIndexConfig,
  SearchPodcastsParams,
  SearchEpisodesParams,
  EpisodesByFeedParams,
  Podcast,
  Episode,
} from '@/lib/pc20-types';

// Query Keys
export const podcastIndexKeys = {
  all: ['podcastIndex'] as const,
  search: () => [...podcastIndexKeys.all, 'search'] as const,
  searchPodcasts: (params: SearchPodcastsParams) => [...podcastIndexKeys.search(), 'podcasts', params] as const,
  searchEpisodes: (params: SearchEpisodesParams) => [...podcastIndexKeys.search(), 'episodes', params] as const,
  podcast: (id: string | number) => [...podcastIndexKeys.all, 'podcast', id] as const,
  episodes: (feedId: string | number) => [...podcastIndexKeys.all, 'episodes', feedId] as const,
  recent: () => [...podcastIndexKeys.all, 'recent'] as const,
  recentEpisodes: (max?: number) => [...podcastIndexKeys.recent(), 'episodes', max] as const,
  recentFeeds: (max?: number) => [...podcastIndexKeys.recent(), 'feeds', max] as const,
};

// Hook for creating and managing Podcast Index client
export function usePodcastIndexClient(config?: PodcastIndexConfig) {
  if (!config) {
    throw new Error('Podcast Index API configuration is required. Get your API key at https://api.podcastindex.org/');
  }

  const client = createPodcastIndexClient(config);
  return client;
}

// Search Hooks

export function useSearchPodcasts(params: SearchPodcastsParams, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.searchPodcasts(params),
    queryFn: () => client.searchPodcasts(params),
    enabled: !!params.q && !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchEpisodes(params: SearchEpisodesParams, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.searchEpisodes(params),
    queryFn: () => client.searchEpisodes(params),
    enabled: !!params.q && !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Podcast Hooks

export function usePodcast(id: number, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.podcast(id),
    queryFn: () => client.getPodcastById(id),
    enabled: !!id && !!config,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePodcastByUrl(url: string, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.podcast(url),
    queryFn: () => client.getPodcastByUrl(url),
    enabled: !!url && !!config,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Episode Hooks

export function useEpisodes(params: EpisodesByFeedParams, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.episodes(params.id || params.url || 'unknown'),
    queryFn: () => {
      if (params.id) {
        return client.getEpisodesByFeedId({ ...params, id: params.id });
      } else if (params.url) {
        return client.getEpisodesByFeedUrl({ ...params, url: params.url });
      }
      throw new Error('Either id or url must be provided');
    },
    enabled: !!(params.id || params.url) && !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Recent Content Hooks

export function useRecentEpisodes(max = 10, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.recentEpisodes(max),
    queryFn: () => client.getRecentEpisodes(max),
    enabled: !!config,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useRecentFeeds(max = 10, config?: PodcastIndexConfig) {
  const client = usePodcastIndexClient(config);

  return useQuery({
    queryKey: podcastIndexKeys.recentFeeds(max),
    queryFn: () => client.getRecentFeeds(max),
    enabled: !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

// Mutation Hooks for actions that might change data

export function useInvalidatePodcastQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: podcastIndexKeys.all });
  };
}

// Utility Hooks

export function usePodcastIndexStats(config?: PodcastIndexConfig) {
  return useQuery({
    queryKey: [...podcastIndexKeys.all, 'stats'],
    queryFn: async () => {
      // This would call a stats endpoint if available
      // For now, return placeholder data
      return {
        totalPodcasts: 0,
        totalEpisodes: 0,
        lastUpdate: new Date().toISOString(),
      };
    },
    enabled: !!config,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Type exports for convenience
export type {
  PodcastIndexConfig,
  SearchPodcastsParams,
  SearchEpisodesParams,
  EpisodesByFeedParams,
  Podcast,
  Episode,
};