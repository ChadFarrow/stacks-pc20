/**
 * Podcasting 2.0 TypeScript Types
 * Based on the official Podcast Index namespace specification
 * https://github.com/Podcastindex-org/podcast-namespace
 */

// Core Podcast Types
export interface Podcast {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId?: number;
  itunesType?: string;
  generator?: string;
  language: string;
  type: number;
  dead: number;
  crawlErrors: number;
  parseErrors: number;
  categories: Record<string, string>;
  locked: number;
  imageUrlHash: number;
  value?: PodcastValue;
  funding?: PodcastFunding[];
  guid?: string;
}

export interface Episode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode?: number;
  episodeType?: string;
  season?: number;
  image: string;
  feedItunesId?: number;
  feedImage: string;
  feedId: number;
  feedTitle: string;
  feedLanguage: string;
  chaptersUrl?: string;
  transcriptUrl?: string;
  value?: EpisodeValue;
  soundbite?: Soundbite[];
  persons?: Person[];
  location?: Location;
  socialInteract?: SocialInteract[];
}

// Podcasting 2.0 Namespace Tags

export interface PodcastValue {
  model: {
    type: string;
    method: string;
    suggested?: string;
  };
  destinations: ValueDestination[];
}

export interface EpisodeValue {
  model: {
    type: string;
    method: string;
    suggested?: string;
  };
  destinations: ValueDestination[];
}

export interface ValueDestination {
  name: string;
  type: string;
  address: string;
  split: number;
  fee?: boolean;
  customKey?: string;
  customValue?: string;
}

export interface PodcastFunding {
  url: string;
  message: string;
}

export interface Person {
  name: string;
  role?: string;
  group?: string;
  img?: string;
  href?: string;
}

export interface Location {
  name: string;
  geo?: string;
  osm?: string;
}

export interface Soundbite {
  startTime: number;
  duration: number;
  title?: string;
}

export interface SocialInteract {
  uri: string;
  protocol: string;
  accountId?: string;
  accountUrl?: string;
  priority?: number;
}

export interface Chapter {
  startTime: number;
  title: string;
  img?: string;
  url?: string;
  toc?: boolean;
  endTime?: number;
}

export interface Transcript {
  url: string;
  type: string;
  language?: string;
  rel?: string;
}

// Podcast Index API Response Types

export interface PodcastIndexResponse<T> {
  status: string;
  feeds?: T[];
  episodes?: T[];
  count?: number;
  query?: string;
  description?: string;
}

export interface SearchPodcastsResponse extends PodcastIndexResponse<Podcast> {
  feeds?: Podcast[];
}
export interface SearchEpisodesResponse extends PodcastIndexResponse<Episode> {
  episodes?: Episode[];
}

export interface PodcastByFeedResponse {
  status: string;
  feed: Podcast;
  query: string;
  description: string;
}

export interface EpisodesByFeedResponse {
  status: string;
  items: Episode[];
  count: number;
  query: string;
  description: string;
}

// Search Parameters
export interface SearchPodcastsParams extends Record<string, unknown> {
  q: string;
  val?: string;
  clean?: boolean;
  fulltext?: boolean;
  max?: number;
  similar?: boolean;
}

export interface SearchEpisodesParams extends Record<string, unknown> {
  q: string;
  val?: string;
  clean?: boolean;
  fulltext?: boolean;
  max?: number;
}

export interface EpisodesByFeedParams extends Record<string, unknown> {
  id?: number;
  url?: string;
  since?: number;
  max?: number;
  fulltext?: boolean;
}

// RSS Feed Types with PC 2.0 Extensions
export interface PC20Feed {
  title: string;
  description: string;
  link: string;
  image?: {
    url: string;
    title?: string;
    link?: string;
  };
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  pubDate?: string;
  lastBuildDate?: string;
  generator?: string;

  // PC 2.0 Extensions
  'podcast:locked'?: {
    owner: string;
    _text: boolean;
  };
  'podcast:funding'?: PodcastFunding | PodcastFunding[];
  'podcast:value'?: PodcastValue;
  'podcast:guid'?: string;
  'podcast:person'?: Person | Person[];
  'podcast:location'?: Location;
  'podcast:socialInteract'?: SocialInteract | SocialInteract[];

  items: PC20Episode[];
}

export interface PC20Episode {
  title: string;
  description: string;
  link?: string;
  guid: string;
  pubDate: string;
  enclosure: {
    url: string;
    type: string;
    length: string;
  };
  duration?: string;
  explicit?: boolean;

  // PC 2.0 Extensions
  'podcast:episode'?: number;
  'podcast:season'?: number;
  'podcast:episodeType'?: string;
  'podcast:transcript'?: Transcript | Transcript[];
  'podcast:chapters'?: {
    url: string;
    type: string;
  };
  'podcast:soundbite'?: Soundbite | Soundbite[];
  'podcast:person'?: Person | Person[];
  'podcast:location'?: Location;
  'podcast:value'?: EpisodeValue;
  'podcast:socialInteract'?: SocialInteract | SocialInteract[];
}

// Enhanced RSS Types (from advanced parser)
export interface RSSTrack {
  title: string;
  duration: string;
  url?: string;
  trackNumber?: number;
  subtitle?: string;
  summary?: string;
  image?: string;
  explicit?: boolean;
  keywords?: string[];
}

export interface RSSFunding {
  url: string;
  message?: string;
}

export interface RSSPodRoll {
  url: string;
  title?: string;
  description?: string;
}

export interface RSSPublisher {
  feedGuid: string;
  feedUrl: string;
  medium: string;
}

export interface RSSPublisherItem {
  feedGuid: string;
  feedUrl: string;
  medium: string;
  title?: string;
}

export interface RSSAlbum {
  title: string;
  artist: string;
  description: string;
  coverArt: string | null;
  tracks: RSSTrack[];
  releaseDate: string;
  duration?: string;
  link?: string;
  funding?: RSSFunding[];
  subtitle?: string;
  summary?: string;
  keywords?: string[];
  categories?: string[];
  explicit?: boolean;
  language?: string;
  copyright?: string;
  owner?: {
    name?: string;
    email?: string;
  };
  podroll?: RSSPodRoll[];
  publisher?: RSSPublisher;
}

// Utility Types
export type PodcastIndexEndpoint =
  | 'search/byterm'
  | 'search/bytitle'
  | 'search/byperson'
  | 'podcasts/byfeedid'
  | 'podcasts/byfeedurl'
  | 'podcasts/byguid'
  | 'episodes/byfeedid'
  | 'episodes/byfeedurl'
  | 'episodes/byguid'
  | 'episodes/byid'
  | 'recent/episodes'
  | 'recent/feeds';

export interface PodcastIndexConfig {
  apiKey: string;
  apiSecret: string;
  userAgent: string;
  baseUrl?: string;
}