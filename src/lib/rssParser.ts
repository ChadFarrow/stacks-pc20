/**
 * RSS Parser with Podcasting 2.0 Support
 *
 * Enhanced RSS parser with advanced capabilities:
 * - Batch processing with optimized performance
 * - Multiple fallback methods for cover art extraction
 * - Better error handling with retry logic
 * - Publisher feed aggregation
 * - Duration format conversion (HH:MM:SS to MM:SS)
 * - HTML content cleaning utilities
 */

import Parser from 'rss-parser';
import type { PC20Feed, PodcastValue, Person, Location, Soundbite } from './pc20-types';

// Enhanced interfaces for advanced RSS parsing
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

// Error handling types
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

// Utility functions
const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

/**
 * Clean HTML content and decode entities
 */
const cleanHtmlContent = (content: string | null | undefined): string | undefined => {
  if (!content) return undefined;

  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/&#x27;/g, "'") // Replace &#x27; with '
    .replace(/&apos;/g, "'") // Replace &apos; with '
    .trim();
};

/**
 * Convert duration from various formats to MM:SS
 */
const normalizeDuration = (duration: string, trackTitle?: string): string => {
  if (!duration || duration.trim() === '') {
    return '0:00';
  }

  const durationStr = duration.trim();

  // If it's just seconds, convert to MM:SS
  if (/^\d+$/.test(durationStr)) {
    const seconds = parseInt(durationStr);
    if (!isNaN(seconds) && seconds > 0) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }
  // Handle HH:MM:SS format (convert to MM:SS)
  else if (durationStr.includes(':')) {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      // MM:SS format - validate and return
      const mins = parseInt(parts[0]);
      const secs = parseInt(parts[1]);
      if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && secs >= 0 && secs < 60) {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
    } else if (parts.length === 3) {
      // HH:MM:SS format - convert to MM:SS
      const hours = parseInt(parts[0]);
      const mins = parseInt(parts[1]);
      const secs = parseInt(parts[2]);
      if (!isNaN(hours) && !isNaN(mins) && !isNaN(secs) &&
          hours >= 0 && mins >= 0 && mins < 60 && secs >= 0 && secs < 60) {
        const totalMinutes = hours * 60 + mins;
        if (trackTitle && hours > 0) {
          console.log(`🔄 Converted HH:MM:SS "${durationStr}" to MM:SS "${totalMinutes}:${secs.toString().padStart(2, '0')}" for "${trackTitle}"`);
        }
        return `${totalMinutes}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }

  // If we can't parse it, return the original or default
  return durationStr || '0:00';
};

/**
 * Extract cover art with multiple fallback methods
 */
const extractCoverArt = (channel: Element, items: NodeListOf<Element>): string | null => {
  let coverArt: string | null = null;

  // Method 1: Try channel-level itunes:image
  let imageElement: Element | null = channel.getElementsByTagName('itunes:image')[0] || null;
  if (!imageElement) {
    // Fallback to querySelector with escaped namespace
    imageElement = channel.querySelector('itunes\\:image');
  }

  if (imageElement) {
    coverArt = imageElement.getAttribute('href') || null;
  }

  // Method 2: Try channel-level image url
  if (!coverArt) {
    const imageUrl = channel.querySelector('image url');
    if (imageUrl) {
      coverArt = imageUrl.textContent?.trim() || null;
    }
  }

  // Method 3: Try channel-level image attributes
  if (!coverArt) {
    const altImageElement = channel.querySelector('image');
    if (altImageElement) {
      const altUrl = altImageElement.getAttribute('url') || altImageElement.getAttribute('href');
      if (altUrl) {
        coverArt = altUrl;
      }
    }
  }

  // Method 4: Try to get artwork from first item if channel-level fails
  if (!coverArt && items.length > 0) {
    const firstItem = items[0];

    // Try item-level itunes:image
    const itemImageElement = firstItem.getElementsByTagName('itunes:image')[0];
    if (itemImageElement) {
      coverArt = itemImageElement.getAttribute('href') || null;
    }

    // Try item-level media:content
    if (!coverArt) {
      const mediaContent = firstItem.getElementsByTagName('media:content')[0];
      if (mediaContent && mediaContent.getAttribute('type')?.startsWith('image/')) {
        coverArt = mediaContent.getAttribute('url') || null;
      }
    }

    // Try item-level enclosure
    if (!coverArt) {
      const enclosure = firstItem.getElementsByTagName('enclosure')[0];
      if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
        coverArt = enclosure.getAttribute('url') || null;
      }
    }
  }

  // Method 5: Try to extract from description if it contains an image
  if (!coverArt) {
    const description = channel.getElementsByTagName('description')[0]?.textContent || '';
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch) {
      coverArt = imgMatch[1];
    }
  }

  // Clean up the cover art URL
  if (coverArt) {
    try {
      const url = new URL(coverArt);
      coverArt = `${url.protocol}//${url.host}${url.pathname}`;
    } catch (error) {
      // If URL parsing fails, keep the original
      console.warn('Invalid cover art URL:', coverArt, error);
    }
  }

  return coverArt;
};

/**
 * Batch processing with optimized performance
 */
export const parseMultipleFeedsInternal = async (feedUrls: string[]): Promise<RSSAlbum[]> => {
  console.log(`🔄 Parsing ${feedUrls.length} RSS feeds...`);

  // Process feeds in larger batches for better performance
  const batchSize = 20;
  const results: RSSAlbum[] = [];

  for (let i = 0; i < feedUrls.length; i += batchSize) {
    const batch = feedUrls.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(feedUrls.length / batchSize)} (${batch.length} feeds)`);

    const promises = batch.map(async (url) => {
      try {
        const parser = new PC20RSSParser();
        return await withRetry(
          () => parser.parseAlbumFeed(url),
          {
            maxRetries: 2,
            delay: 1000,
            onRetry: (attempt, error) => {
              console.warn(`⚠️ Retrying feed parse (attempt ${attempt})`, { url, error: error.message });
            }
          }
        );
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          console.error(`❌ NetworkError when attempting to fetch resource.`);
          console.log('🔍 Error details:', {
            message: error.message,
            stack: error.stack,
            feedUrl: url
          });
          return null;
        }
        console.error(`❌ Failed to parse feed ${url} after retries:`, error);
        return null;
      }
    });

    const batchResults = await Promise.allSettled(promises);

    const successful = batchResults.filter((result): result is PromiseFulfilledResult<RSSAlbum> =>
      result.status === 'fulfilled' && result.value !== null);

    const failed = batchResults.filter(result => result.status === 'rejected' || result.value === null);

    if (failed.length > 0) {
      console.warn(`⚠️ Failed to parse ${failed.length} feeds in batch ${Math.floor(i / batchSize) + 1}`);
      failed.slice(0, 3).forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to parse feed ${batch[index]}: ${result.reason}`);
        } else if (result.status === 'fulfilled' && result.value === null) {
          console.error(`❌ Feed ${batch[index]} returned null`);
        }
      });
      if (failed.length > 3) {
        console.warn(`... and ${failed.length - 3} more failures`);
      }
    }

    results.push(...successful.map(result => result.value));

    // Reduced delay between batches for faster loading
    if (i + batchSize < feedUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  console.log(`✅ Successfully parsed ${results.length} albums from ${feedUrls.length} feeds`);
  return results;
};

// Enhanced RSS parser with PC 2.0 namespace support and advanced features
export class PC20RSSParser extends Parser {
  protected static readonly logger = {
    info: (message: string, data?: any) => console.log(`ℹ️ ${message}`, data || ''),
    warn: (message: string, data?: any) => console.warn(`⚠️ ${message}`, data || ''),
    error: (message: string, error?: any, data?: any) => console.error(`❌ ${message}`, error, data || ''),
  };

  constructor() {
    super({
      customFields: {
        feed: [
          'podcast:locked',
          'podcast:funding',
          'podcast:value',
          'podcast:guid',
          'podcast:person',
          'podcast:location',
          'podcast:socialInteract',
          'podcast:podroll',
          'podcast:remoteItem',
        ],
        item: [
          'podcast:episode',
          'podcast:season',
          'podcast:episodeType',
          'podcast:transcript',
          'podcast:chapters',
          'podcast:soundbite',
          'podcast:person',
          'podcast:location',
          'podcast:value',
          'podcast:socialInteract',
        ],
      },
    });
  }

  /**
   * Parse RSS feed with PC 2.0 extensions and enhanced error handling
   */
  async parsePC20Feed(feedUrl: string): Promise<PC20Feed> {
    return withRetry(async () => {
      PC20RSSParser.logger.info('Parsing RSS feed', { feedUrl });

      // For server-side fetching, always use direct URLs
      // For client-side fetching, use the proxy
      const isServer = typeof window === 'undefined';

      let response;
      try {
        if (isServer) {
          // Server-side: fetch directly
          response = await fetch(feedUrl);
        } else {
          // Client-side: use proxy if needed
          const isAlreadyProxied = feedUrl.startsWith('/api/fetch-rss');
          const proxyUrl = isAlreadyProxied ? feedUrl : `/api/fetch-rss?url=${encodeURIComponent(feedUrl)}`;
          response = await fetch(proxyUrl);
        }
      } catch (error) {
        throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Network error'}`);
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`Rate limited while fetching RSS feed: ${response.status}`);
        }
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();

      // Validate response content
      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error('Empty response from RSS feed');
      }

      if (!xmlText.includes('<') || !xmlText.includes('>')) {
        PC20RSSParser.logger.error('Invalid XML response', null, {
          feedUrl,
          responsePreview: xmlText.substring(0, 200)
        });
        throw new Error('Response is not valid XML');
      }

      const feed = await this.parseString(xmlText);
      return this.enhanceWithPC20Data(feed as unknown as PC20Feed);
    }, {
      maxRetries: 3,
      delay: 1000,
      onRetry: (attempt, error) => {
        PC20RSSParser.logger.warn(`Retrying RSS feed parse (attempt ${attempt})`, { feedUrl, error: error.message });
      }
    });
  }

  /**
   * Parse RSS feed from string content
   */
  async parsePC20String(feedContent: string): Promise<PC20Feed> {
    try {
      const feed = await this.parseString(feedContent);
      return this.enhanceWithPC20Data(feed as unknown as PC20Feed);
    } catch (error) {
      throw new Error(`Failed to parse RSS content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse album feed with enhanced features
   */
  async parseAlbumFeed(feedUrl: string): Promise<RSSAlbum | null> {
    return withRetry(async () => {
      PC20RSSParser.logger.info('Parsing album RSS feed', { feedUrl });

      const isServer = typeof window === 'undefined';

      let response;
      try {
        if (isServer) {
          response = await fetch(feedUrl);
        } else {
          const isAlreadyProxied = feedUrl.startsWith('/api/fetch-rss');
          const proxyUrl = isAlreadyProxied ? feedUrl : `/api/fetch-rss?url=${encodeURIComponent(feedUrl)}`;
          response = await fetch(proxyUrl);
        }
      } catch (error) {
        throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Network error'}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();

      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error('Empty response from RSS feed');
      }

      if (!xmlText.includes('<') || !xmlText.includes('>')) {
        throw new Error('Response is not valid XML');
      }

      // Parse XML content
      let xmlDoc: any;
      try {
        if (typeof window !== 'undefined') {
          const parser = new DOMParser();
          xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        } else {
          const { DOMParser } = await import('@xmldom/xmldom');
          const parser = new DOMParser();
          xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        }

        const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
        if (parserError) {
          throw new Error(`Invalid XML format: ${parserError.textContent}`);
        }
      } catch (error) {
        throw new Error(`Failed to parse XML content: ${error instanceof Error ? error.message : 'Parse error'}`);
      }

      // Extract channel info
      const channels = xmlDoc.getElementsByTagName('channel');
      if (!channels || channels.length === 0) {
        throw new Error('Invalid RSS feed: no channel found');
      }
      const channel = channels[0];

      const titleElement = channel.getElementsByTagName('title')[0];
      const title = titleElement?.textContent?.trim() || 'Unknown Album';
      const descriptionElement = channel.getElementsByTagName('description')[0];
      const description = descriptionElement?.textContent?.trim() || '';
      const linkElement = channel.getElementsByTagName('link')[0];
      const link = linkElement?.textContent?.trim() || '';

      // Extract artist from title or author
      let artist = 'Unknown Artist';
      const authorElements = channel.getElementsByTagName('itunes:author');
      const authorElement = authorElements.length > 0 ? authorElements[0] : channel.getElementsByTagName('author')[0];
      if (authorElement) {
        artist = authorElement.textContent?.trim() || artist;
      } else {
        // Try to extract artist from title (format: "Artist - Album")
        const titleParts = title.split(' - ');
        if (titleParts.length > 1) {
          artist = titleParts[0].trim();
        }
      }

      // Extract tracks from items
      const items = xmlDoc.getElementsByTagName('item');

      // Extract cover art with enhanced fallback logic
      const coverArt = extractCoverArt(channel, items);

      if (coverArt) {
        console.log(`🎨 Found cover art for "${title}": ${coverArt}`);
      } else {
        console.warn(`⚠️ No cover art found for "${title}"`);
      }

      // Extract additional channel metadata
      const subtitle = channel.getElementsByTagName('itunes:subtitle')[0]?.textContent?.trim();
      const summary = channel.getElementsByTagName('itunes:summary')[0]?.textContent?.trim();
      const languageEl = channel.getElementsByTagName('language')[0];
      const language = languageEl?.textContent?.trim();
      const copyrightEl = channel.getElementsByTagName('copyright')[0];
      const copyright = copyrightEl?.textContent?.trim();

      // Extract explicit rating
      const explicitEl = channel.getElementsByTagName('itunes:explicit')[0];
      const explicit = explicitEl?.textContent?.trim().toLowerCase() === 'true';

      // Extract keywords
      const keywordsEl = channel.getElementsByTagName('itunes:keywords')[0];
      const keywords = keywordsEl?.textContent?.trim().split(',').map((k: string) => k.trim()).filter((k: string) => k) || [];

      // Extract categories
      const categoryElements = channel.getElementsByTagName('itunes:category');
      const categories = Array.from(categoryElements).map((cat: unknown) => (cat as Element).getAttribute('text')).filter(Boolean) as string[];

      // Extract owner info
      const ownerEl = channel.getElementsByTagName('itunes:owner')[0];
      const owner = ownerEl ? {
        name: ownerEl.getElementsByTagName('itunes:name')[0]?.textContent?.trim(),
        email: ownerEl.getElementsByTagName('itunes:email')[0]?.textContent?.trim()
      } : undefined;

      // Extract tracks from items with enhanced processing
      const tracks: RSSTrack[] = [];

      console.log(`🎵 Found ${items.length} items in RSS feed`);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const trackTitle = item.getElementsByTagName('title')[0]?.textContent?.trim() || `Track ${i + 1}`;

        // Enhanced duration parsing
        let duration = '0:00';
        const itunesDuration = item.getElementsByTagName('itunes:duration')[0];
        const durationElement = item.getElementsByTagName('duration')[0];

        if (itunesDuration?.textContent?.trim()) {
          duration = itunesDuration.textContent.trim();
        } else if (durationElement?.textContent?.trim()) {
          duration = durationElement.textContent.trim();
        }

        duration = normalizeDuration(duration, trackTitle);

        // Enhanced URL extraction with multiple methods
        let url: string | undefined = undefined;

        // Method 1: Try enclosure tag (standard RSS)
        const enclosureElement = item.getElementsByTagName('enclosure')[0];
        if (enclosureElement) {
          url = enclosureElement.getAttribute('url') || undefined;
        }

        // Method 2: Try link tag
        if (!url) {
          const linkElement = item.getElementsByTagName('link')[0];
          if (linkElement) {
            url = linkElement.textContent?.trim() || undefined;
          }
        }

        // Method 3: Try media:content tag
        if (!url) {
          const mediaContent = item.getElementsByTagName('media:content')[0];
          if (mediaContent) {
            url = mediaContent.getAttribute('url') || undefined;
          }
        }

        // Extract track-specific metadata
        const trackSubtitle = item.getElementsByTagName('itunes:subtitle')[0]?.textContent?.trim();
        const trackSummary = item.getElementsByTagName('itunes:summary')[0]?.textContent?.trim();
        const trackImageEl = item.getElementsByTagName('itunes:image')[0];
        const trackImage = trackImageEl?.getAttribute('href') || trackImageEl?.getAttribute('url');
        const trackExplicitEl = item.getElementsByTagName('itunes:explicit')[0];
        const trackExplicit = trackExplicitEl?.textContent?.trim().toLowerCase() === 'true';
        const trackKeywordsEl = item.getElementsByTagName('itunes:keywords')[0];
        const trackKeywords = trackKeywordsEl?.textContent?.trim().split(',').map((k: string) => k.trim()).filter((k: string) => k) || [];

        tracks.push({
          title: trackTitle,
          duration: duration,
          url: url,
          trackNumber: i + 1,
          subtitle: cleanHtmlContent(trackSubtitle),
          summary: cleanHtmlContent(trackSummary),
          image: trackImage || undefined,
          explicit: trackExplicit,
          keywords: trackKeywords.length > 0 ? trackKeywords : undefined
        });

        console.log(`✅ Added track: "${trackTitle}" (${duration}) - URL: ${url ? 'Found' : 'Missing'}`);
      }

      // Extract release date
      const pubDateElement = channel.getElementsByTagName('pubDate')[0] || channel.getElementsByTagName('lastBuildDate')[0];
      const releaseDate = pubDateElement?.textContent?.trim() || new Date().toISOString();

      // Extract funding information with enhanced parsing
      const funding: RSSFunding[] = [];
      const fundingElements1 = Array.from(channel.getElementsByTagName('podcast:funding'));
      const fundingElements2 = Array.from(channel.getElementsByTagName('funding'));
      const allFundingElements = [...fundingElements1, ...fundingElements2];

      allFundingElements.forEach((fundingElement: unknown) => {
        const element = fundingElement as Element;
        const url = element.getAttribute('url') || element.textContent?.trim();
        const message = element.textContent?.trim() || element.getAttribute('message');

        if (url) {
          funding.push({
            url: url,
            message: message || undefined
          });
        }
      });

      // Extract PodRoll information
      const podroll: RSSPodRoll[] = [];
      const podrollElements1 = Array.from(channel.getElementsByTagName('podcast:podroll'));
      const podrollElements2 = Array.from(channel.getElementsByTagName('podroll'));
      const allPodrollElements = [...podrollElements1, ...podrollElements2];

      allPodrollElements.forEach((podrollElement: unknown) => {
        const podrollEl = podrollElement as Element;
        const remoteItems1 = Array.from(podrollEl.getElementsByTagName('podcast:remoteItem'));
        const remoteItems2 = Array.from(podrollEl.getElementsByTagName('remoteItem'));
        const allRemoteItems = [...remoteItems1, ...remoteItems2];

        allRemoteItems.forEach((remoteItem: unknown) => {
          const remoteEl = remoteItem as Element;
          const feedUrl = remoteEl.getAttribute('feedUrl');
          const feedGuid = remoteEl.getAttribute('feedGuid');
          const title = remoteEl.getAttribute('title') || remoteEl.textContent?.trim();
          const description = remoteEl.getAttribute('description');

          if (feedUrl) {
            podroll.push({
              url: feedUrl,
              title: title || `Feed ${feedGuid ? feedGuid.substring(0, 8) + '...' : 'Unknown'}`,
              description: description || undefined
            });
          }
        });
      });

      // Extract Publisher information
      let publisher: RSSPublisher | undefined = undefined;
      const remoteItems = Array.from(channel.getElementsByTagName('podcast:remoteItem'));
      const publisherRemoteItem = remoteItems.find((item: unknown) => {
        const element = item as Element;
        return element.getAttribute('medium') === 'publisher';
      });

      if (publisherRemoteItem) {
        const element = publisherRemoteItem as Element;
        const feedGuid = element.getAttribute('feedGuid');
        const feedUrl = element.getAttribute('feedUrl');
        const medium = element.getAttribute('medium');

        if (feedGuid && feedUrl && medium) {
          publisher = {
            feedGuid,
            feedUrl,
            medium
          };
        }
      }

      const album = {
        title,
        artist,
        description: cleanHtmlContent(description) || '',
        coverArt,
        tracks,
        releaseDate,
        link,
        funding: funding.length > 0 ? funding : undefined,
        subtitle: cleanHtmlContent(subtitle),
        summary: cleanHtmlContent(summary),
        keywords: keywords.length > 0 ? keywords : undefined,
        categories: categories.length > 0 ? categories : undefined,
        explicit,
        language,
        copyright,
        owner: owner && (owner.name || owner.email) ? owner : undefined,
        podroll: podroll.length > 0 ? podroll : undefined,
        publisher: publisher
      };

      PC20RSSParser.logger.info('Successfully parsed RSS feed', { feedUrl, trackCount: tracks.length });
      return album;

    }, {
      maxRetries: 3,
      delay: 1000,
      onRetry: (attempt, error) => {
        PC20RSSParser.logger.warn(`Retrying RSS feed parse (attempt ${attempt})`, { feedUrl, error: error.message });
      }
    }).catch(error => {
      PC20RSSParser.logger.error('Failed to parse RSS feed after retries', error, { feedUrl });
      return null;
    });
  }

  /**
   * Parse publisher feed to extract music items
   */
  async parsePublisherFeed(feedUrl: string): Promise<RSSPublisherItem[]> {
    try {
      // Handle special cases
      if (feedUrl === 'iroh-aggregated') {
        console.log('🎵 Loading IROH aggregated feed from Wavlake...');
        const actualFeedUrl = 'https://wavlake.com/feed/artist/8a9c2e54-785a-4128-9412-737610f5d00a';
        return this.parsePublisherFeedFromUrl(actualFeedUrl);
      }

      if (typeof feedUrl !== 'string') {
        console.error('parsePublisherFeed: feedUrl is not a string:', feedUrl);
        throw new TypeError('feedUrl must be a string (URL). Received: ' + typeof feedUrl);
      }

      return this.parsePublisherFeedFromUrl(feedUrl);
    } catch (error) {
      console.error('❌ Error parsing publisher feed:', error);
      return [];
    }
  }

  /**
   * Parse publisher feed from URL
   */
  private async parsePublisherFeedFromUrl(feedUrl: string): Promise<RSSPublisherItem[]> {
    const isServer = typeof window === 'undefined';

    let response;
    if (isServer) {
      response = await fetch(feedUrl);
    } else {
      const isAlreadyProxied = feedUrl.startsWith('/api/fetch-rss');
      const proxyUrl = isAlreadyProxied ? feedUrl : `/api/fetch-rss?url=${encodeURIComponent(feedUrl)}`;
      response = await fetch(proxyUrl);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch publisher feed: ${response.status}`);
    }

    const xmlText = await response.text();

    let xmlDoc: any;
    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    } else {
      const { DOMParser } = await import('@xmldom/xmldom');
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    }

    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
      throw new Error('Invalid XML format');
    }

    const channels = xmlDoc.getElementsByTagName('channel');
    if (!channels || channels.length === 0) {
      throw new Error('Invalid RSS feed: no channel found');
    }
    const channel = channels[0];

    const publisherItems: RSSPublisherItem[] = [];
    const remoteItems = Array.from(channel.getElementsByTagName('podcast:remoteItem'));

    remoteItems.forEach((item: unknown) => {
      const element = item as Element;
      const medium = element.getAttribute('medium');
      const feedGuid = element.getAttribute('feedGuid');
      const feedUrl = element.getAttribute('feedUrl');
      const title = element.getAttribute('title') || element.textContent?.trim();

      if (medium === 'music' && feedGuid && feedUrl) {
        publisherItems.push({
          feedGuid,
          feedUrl,
          medium,
          title
        });
      }
    });

    console.log(`🏢 Found ${publisherItems.length} music items in publisher feed: ${feedUrl}`);
    return publisherItems;
  }

  /**
   * Parse publisher feed and get all albums
   */
  async parsePublisherFeedAlbums(feedUrl: string): Promise<RSSAlbum[]> {
    console.log(`🏢 Parsing publisher feed for albums: ${feedUrl}`);

    const publisherItems = await this.parsePublisherFeed(feedUrl);

    if (publisherItems.length === 0) {
      console.log(`📭 No music items found in publisher feed: ${feedUrl}`);
      return [];
    }

    const musicFeedUrls = publisherItems.map(item => item.feedUrl);
    console.log(`🎵 Loading ${musicFeedUrls.length} music feeds from publisher...`);

    // Optimize batch size based on number of feeds
    let batchSize = 5;
    let delayMs = 500;

    if (musicFeedUrls.length > 20) {
      batchSize = 8;
      delayMs = 300;
    }

    const allAlbums: RSSAlbum[] = [];

    for (let i = 0; i < musicFeedUrls.length; i += batchSize) {
      const batch = musicFeedUrls.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(musicFeedUrls.length / batchSize);

      console.log(`📦 Processing publisher batch ${batchNumber}/${totalBatches} (${batch.length} feeds)`);

      try {
        const batchAlbums = await parseMultipleFeedsInternal(batch);
        allAlbums.push(...batchAlbums);
        console.log(`✅ Batch ${batchNumber}/${totalBatches} completed: ${batchAlbums.length} albums (${allAlbums.length}/${musicFeedUrls.length} total)`);
      } catch (error) {
        console.error(`❌ Error in publisher batch ${batchNumber}/${totalBatches}:`, error);
      }

      if (i + batchSize < musicFeedUrls.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log(`🎶 Loaded ${allAlbums.length} albums from publisher feed`);
    return allAlbums;
  }

  /**
   * Parse publisher feed info (title, description, etc.)
   */
  async parsePublisherFeedInfo(feedUrl: string): Promise<{ title?: string; description?: string; artist?: string; coverArt?: string } | null> {
    try {
      const isServer = typeof window === 'undefined';

      let response;
      if (isServer) {
        response = await fetch(feedUrl);
      } else {
        const isAlreadyProxied = feedUrl.startsWith('/api/fetch-rss');
        const proxyUrl = isAlreadyProxied ? feedUrl : `/api/fetch-rss?url=${encodeURIComponent(feedUrl)}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch publisher feed: ${response.status}`);
      }

      const xmlText = await response.text();

      let xmlDoc: any;
      if (typeof window !== 'undefined') {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      } else {
        const { DOMParser } = await import('@xmldom/xmldom');
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      }

      const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const channels = xmlDoc.getElementsByTagName('channel');
      if (!channels || channels.length === 0) {
        throw new Error('Invalid RSS feed: no channel found');
      }
      const channel = channels[0];

      const titleElement = channel.getElementsByTagName('title')[0];
      const title = titleElement?.textContent?.trim() || '';
      const descriptionElement = channel.getElementsByTagName('description')[0];
      const description = descriptionElement?.textContent?.trim() || '';

      let artist = title;
      const authorElements = channel.getElementsByTagName('itunes:author');
      const authorElement = authorElements.length > 0 ? authorElements[0] : channel.getElementsByTagName('author')[0];
      if (authorElement) {
        artist = authorElement.textContent?.trim() || artist;
      }

      const coverArt = extractCoverArt(channel, channel.getElementsByTagName('item'));

      return {
        title,
        description,
        artist,
        coverArt: coverArt || undefined
      };

    } catch (error) {
      console.error('❌ Error parsing publisher feed info:', error);
      return null;
    }
  }

  /**
   * Static method for batch processing multiple feeds
   */
  static async parseMultipleFeeds(feedUrls: string[]): Promise<RSSAlbum[]> {
    return parseMultipleFeedsInternal(feedUrls);
  }

  /**
   * Enhance parsed feed with PC 2.0 data processing
   */
  private enhanceWithPC20Data(feed: PC20Feed): PC20Feed {
    // Process feed-level PC 2.0 data
    if (feed['podcast:value']) {
      (feed as any)['podcast:value'] = this.parseValueTag(feed['podcast:value']);
    }

    if (feed['podcast:person']) {
      (feed as any)['podcast:person'] = this.parsePersonTags(feed['podcast:person']);
    }

    if (feed['podcast:location']) {
      (feed as any)['podcast:location'] = this.parseLocationTag(feed['podcast:location']);
    }

    // Process episode-level PC 2.0 data
    feed.items = feed.items.map(episode => {
      if ((episode as any)['podcast:value']) {
        (episode as any)['podcast:value'] = this.parseValueTag((episode as any)['podcast:value']);
      }

      if ((episode as any)['podcast:person']) {
        (episode as any)['podcast:person'] = this.parsePersonTags((episode as any)['podcast:person']);
      }

      if ((episode as any)['podcast:location']) {
        (episode as any)['podcast:location'] = this.parseLocationTag((episode as any)['podcast:location']);
      }

      if ((episode as any)['podcast:soundbite']) {
        (episode as any)['podcast:soundbite'] = this.parseSoundbites((episode as any)['podcast:soundbite']);
      }

      return episode;
    });

    return feed;
  }

  /**
   * Parse podcast:value tag
   */
  private parseValueTag(value: unknown): PodcastValue | unknown {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  /**
   * Parse podcast:person tags
   */
  private parsePersonTags(persons: unknown): Person | Person[] {
    if (Array.isArray(persons)) {
      return persons.map(person => this.parsePersonTag(person));
    }
    return this.parsePersonTag(persons);
  }

  /**
   * Parse individual podcast:person tag
   */
  private parsePersonTag(person: unknown): Person {
    if (typeof person === 'string') {
      return { name: person };
    }

    const p = person as any;
    return {
      name: p?.name || p?._text || '',
      role: p?.role,
      group: p?.group,
      img: p?.img,
      href: p?.href,
    };
  }

  /**
   * Parse podcast:location tag
   */
  private parseLocationTag(location: unknown): Location {
    if (typeof location === 'string') {
      return { name: location };
    }

    const l = location as any;
    return {
      name: l?.name || l?._text || '',
      geo: l?.geo,
      osm: l?.osm,
    };
  }

  /**
   * Parse podcast:soundbite tags
   */
  private parseSoundbites(soundbites: unknown): Soundbite | Soundbite[] {
    if (Array.isArray(soundbites)) {
      return soundbites.map(sb => this.parseSoundbite(sb));
    }
    return this.parseSoundbite(soundbites);
  }

  /**
   * Parse individual podcast:soundbite tag
   */
  private parseSoundbite(soundbite: unknown): Soundbite {
    const s = soundbite as any;
    return {
      startTime: parseFloat(s?.startTime || s?.start || '0'),
      duration: parseFloat(s?.duration || '0'),
      title: s?.title || s?._text,
    };
  }
}

// Static utility methods
export class RSSParser extends PC20RSSParser {
  /**
   * Parse album feed with enhanced features (static method)
   */
  static async parseAlbumFeed(feedUrl: string): Promise<RSSAlbum | null> {
    const parser = new PC20RSSParser();
    return parser.parseAlbumFeed(feedUrl);
  }

  /**
   * Parse publisher feed (static method)
   */
  static async parsePublisherFeed(feedUrl: string): Promise<RSSPublisherItem[]> {
    const parser = new PC20RSSParser();
    return parser.parsePublisherFeed(feedUrl);
  }

  /**
   * Parse publisher feed albums (static method)
   */
  static async parsePublisherFeedAlbums(feedUrl: string): Promise<RSSAlbum[]> {
    const parser = new PC20RSSParser();
    return parser.parsePublisherFeedAlbums(feedUrl);
  }

  /**
   * Parse publisher feed info (static method)
   */
  static async parsePublisherFeedInfo(feedUrl: string): Promise<{ title?: string; description?: string; artist?: string; coverArt?: string } | null> {
    const parser = new PC20RSSParser();
    return parser.parsePublisherFeedInfo(feedUrl);
  }
}

/**
 * Create a new PC 2.0 RSS parser instance
 */
export function createPC20Parser(): PC20RSSParser {
  return new PC20RSSParser();
}

/**
 * Quick utility to parse a PC 2.0 feed
 */
export async function parsePC20Feed(feedUrl: string): Promise<PC20Feed> {
  const parser = createPC20Parser();
  return parser.parsePC20Feed(feedUrl);
}

/**
 * Quick utility to parse PC 2.0 feed from string
 */
export async function parsePC20String(feedContent: string): Promise<PC20Feed> {
  const parser = createPC20Parser();
  return parser.parsePC20String(feedContent);
}

/**
 * Quick utility to parse album feed
 */
export async function parseAlbumFeed(feedUrl: string): Promise<RSSAlbum | null> {
  return RSSParser.parseAlbumFeed(feedUrl);
}

/**
 * Quick utility for batch processing
 */
export async function parseMultipleFeeds(feedUrls: string[]): Promise<RSSAlbum[]> {
  return RSSParser.parseMultipleFeeds(feedUrls);
}

/**
 * Validate if a feed contains PC 2.0 extensions
 */
export function hasPC20Extensions(feed: PC20Feed): boolean {
  const pc20Fields = [
    'podcast:locked',
    'podcast:funding',
    'podcast:value',
    'podcast:guid',
    'podcast:person',
    'podcast:location',
  ];

  return pc20Fields.some(field => feed[field as keyof PC20Feed] !== undefined);
}

/**
 * Extract PC 2.0 features from a feed
 */
export function getPC20Features(feed: PC20Feed): string[] {
  const features: string[] = [];

  if (feed['podcast:locked']) features.push('Locked');
  if (feed['podcast:funding']) features.push('Funding');
  if (feed['podcast:value']) features.push('Value4Value');
  if (feed['podcast:guid']) features.push('GUID');
  if (feed['podcast:person']) features.push('Person Tags');
  if (feed['podcast:location']) features.push('Location');

  // Check episodes for additional features
  const hasChapters = feed.items.some(item => item['podcast:chapters']);
  const hasTranscripts = feed.items.some(item => item['podcast:transcript']);
  const hasSoundbites = feed.items.some(item => item['podcast:soundbite']);

  if (hasChapters) features.push('Chapters');
  if (hasTranscripts) features.push('Transcripts');
  if (hasSoundbites) features.push('Soundbites');

  return features;
}

/**
 * Utility functions for external use
 */
export const RSSUtils = {
  cleanHtmlContent,
  normalizeDuration,
  extractCoverArt,
  withRetry,
};