/**
 * Podcast Index API Client
 *
 * A TypeScript client for the Podcast Index API with full PC 2.0 support.
 * Get your API credentials at: https://api.podcastindex.org/
 *
 * Documentation: https://podcastindex-org.github.io/docs-api/
 */

import type {
  PodcastIndexConfig,
  PodcastIndexEndpoint,
  SearchPodcastsParams,
  SearchEpisodesParams,
  EpisodesByFeedParams,
  SearchPodcastsResponse,
  SearchEpisodesResponse,
  PodcastByFeedResponse,
  EpisodesByFeedResponse,
} from './pc20-types';

export class PodcastIndexClient {
  private config: PodcastIndexConfig;
  private baseUrl: string;

  constructor(config: PodcastIndexConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.podcastindex.org/api/1.0';
  }

  /**
   * Generate authentication headers for Podcast Index API
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const data4Hash = this.config.apiKey + this.config.apiSecret + apiHeaderTime;

    // Create SHA-1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(data4Hash);

    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      'User-Agent': this.config.userAgent,
      'X-Auth-Date': apiHeaderTime.toString(),
      'X-Auth-Key': this.config.apiKey,
      'Authorization': hashHex,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make authenticated request to Podcast Index API
   */
  private async request<T>(endpoint: PodcastIndexEndpoint, params: Record<string, unknown> = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search Methods

  /**
   * Search for podcasts by term
   */
  async searchPodcasts(params: SearchPodcastsParams): Promise<SearchPodcastsResponse> {
    return this.request('search/byterm', params);
  }

  /**
   * Search for podcasts by title
   */
  async searchPodcastsByTitle(title: string, similar = false): Promise<SearchPodcastsResponse> {
    return this.request('search/bytitle', { q: title, similar });
  }

  /**
   * Search for podcasts by person
   */
  async searchPodcastsByPerson(person: string, fulltext = false): Promise<SearchPodcastsResponse> {
    return this.request('search/byperson', { q: person, fulltext });
  }

  /**
   * Search for episodes
   */
  async searchEpisodes(params: SearchEpisodesParams): Promise<SearchEpisodesResponse> {
    return this.request('search/byterm', params);
  }

  // Podcast Methods

  /**
   * Get podcast by feed ID
   */
  async getPodcastById(id: number): Promise<PodcastByFeedResponse> {
    return this.request('podcasts/byfeedid', { id });
  }

  /**
   * Get podcast by feed URL
   */
  async getPodcastByUrl(url: string): Promise<PodcastByFeedResponse> {
    return this.request('podcasts/byfeedurl', { url });
  }

  /**
   * Get podcast by GUID
   */
  async getPodcastByGuid(guid: string): Promise<PodcastByFeedResponse> {
    return this.request('podcasts/byguid', { guid });
  }

  // Episode Methods

  /**
   * Get episodes by feed ID
   */
  async getEpisodesByFeedId(params: EpisodesByFeedParams & { id: number }): Promise<EpisodesByFeedResponse> {
    return this.request('episodes/byfeedid', params);
  }

  /**
   * Get episodes by feed URL
   */
  async getEpisodesByFeedUrl(params: EpisodesByFeedParams & { url: string }): Promise<EpisodesByFeedResponse> {
    return this.request('episodes/byfeedurl', params);
  }

  /**
   * Get episode by GUID
   */
  async getEpisodeByGuid(guid: string, feedurl?: string, feedid?: number): Promise<unknown> {
    return this.request('episodes/byguid', { guid, feedurl, feedid });
  }

  /**
   * Get episode by ID
   */
  async getEpisodeById(id: number, fulltext = false): Promise<unknown> {
    return this.request('episodes/byid', { id, fulltext });
  }

  // Recent Content Methods

  /**
   * Get recent episodes
   */
  async getRecentEpisodes(max = 10, excludeString?: string, before?: number): Promise<unknown> {
    return this.request('recent/episodes', { max, excludeString, before });
  }

  /**
   * Get recent feeds
   */
  async getRecentFeeds(max = 10, since?: number, lang?: string): Promise<unknown> {
    return this.request('recent/feeds', { max, since, lang });
  }
}

/**
 * Create a Podcast Index client instance
 */
export function createPodcastIndexClient(config: PodcastIndexConfig): PodcastIndexClient {
  return new PodcastIndexClient(config);
}

/**
 * Default configuration for development
 * Replace with your actual API credentials
 */
export const defaultConfig: Partial<PodcastIndexConfig> = {
  userAgent: 'PC20Starter/1.0',
  baseUrl: 'https://api.podcastindex.org/api/1.0',
};