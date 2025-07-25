# Podcast Index API Reference

This reference covers the Podcast Index API integration included in this starter template.

## Getting Started

### 1. Get API Credentials

Visit [api.podcastindex.org](https://api.podcastindex.org/) to get your API key and secret.

### 2. Configure the Client

```typescript
import { createPodcastIndexClient } from '@/lib/podcastIndex';

const config = {
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  userAgent: 'YourApp/1.0',
};

const client = createPodcastIndexClient(config);
```

### 3. Use React Hooks

```typescript
import { useSearchPodcasts } from '@/hooks/usePodcastIndex';

function SearchComponent() {
  const { data, isLoading, error } = useSearchPodcasts(
    { q: 'javascript', max: 10 },
    config
  );

  // Handle data, loading, and error states
}
```

## API Client Methods

### Search Methods

#### `searchPodcasts(params)`

Search for podcasts by term.

```typescript
const results = await client.searchPodcasts({
  q: 'javascript',           // Required: search term
  val: 'lightning',          // Optional: value filter
  clean: true,               // Optional: exclude explicit content
  fulltext: false,           // Optional: search descriptions
  max: 20,                   // Optional: max results (default: 10)
  similar: false             // Optional: include similar results
});
```

#### `searchPodcastsByTitle(title, similar?)`

Search for podcasts by exact title match.

```typescript
const results = await client.searchPodcastsByTitle('The Joe Rogan Experience', true);
```

#### `searchPodcastsByPerson(person, fulltext?)`

Search for podcasts by person name.

```typescript
const results = await client.searchPodcastsByPerson('Joe Rogan', true);
```

#### `searchEpisodes(params)`

Search for episodes across all podcasts.

```typescript
const results = await client.searchEpisodes({
  q: 'artificial intelligence',
  max: 50,
  clean: true,
  fulltext: true
});
```

### Podcast Methods

#### `getPodcastById(id)`

Get podcast details by feed ID.

```typescript
const podcast = await client.getPodcastById(920666);
```

#### `getPodcastByUrl(url)`

Get podcast details by feed URL.

```typescript
const podcast = await client.getPodcastByUrl('https://feeds.example.com/podcast.xml');
```

#### `getPodcastByGuid(guid)`

Get podcast details by GUID.

```typescript
const podcast = await client.getPodcastByGuid('ead4c236-bf58-58c6-a2c6-a6b28d128cb6');
```

### Episode Methods

#### `getEpisodesByFeedId(params)`

Get episodes for a specific podcast feed.

```typescript
const episodes = await client.getEpisodesByFeedId({
  id: 920666,                // Required: feed ID
  since: 1640995200,         // Optional: episodes since timestamp
  max: 100,                  // Optional: max episodes
  fulltext: true             // Optional: include full episode text
});
```

#### `getEpisodesByFeedUrl(params)`

Get episodes by feed URL.

```typescript
const episodes = await client.getEpisodesByFeedUrl({
  url: 'https://feeds.example.com/podcast.xml',
  max: 50
});
```

#### `getEpisodeByGuid(guid, feedurl?, feedid?)`

Get specific episode by GUID.

```typescript
const episode = await client.getEpisodeByGuid(
  'episode-guid-123',
  'https://feeds.example.com/podcast.xml'
);
```

#### `getEpisodeById(id, fulltext?)`

Get episode by ID.

```typescript
const episode = await client.getEpisodeById(123456789, true);
```

### Recent Content Methods

#### `getRecentEpisodes(max?, excludeString?, before?)`

Get recently published episodes.

```typescript
const recentEpisodes = await client.getRecentEpisodes(
  20,                        // max episodes
  'explicit',                // exclude string
  1640995200                 // before timestamp
);
```

#### `getRecentFeeds(max?, since?, lang?)`

Get recently added or updated feeds.

```typescript
const recentFeeds = await client.getRecentFeeds(
  10,                        // max feeds
  1640995200,                // since timestamp
  'en'                       // language
);
```

## React Hooks

### Search Hooks

#### `useSearchPodcasts(params, config)`

```typescript
const { data, isLoading, error, refetch } = useSearchPodcasts(
  { q: 'technology', max: 20 },
  config
);

// data.feeds contains the podcast results
// data.count contains the total count
```

#### `useSearchEpisodes(params, config)`

```typescript
const { data, isLoading, error } = useSearchEpisodes(
  { q: 'AI', fulltext: true },
  config
);
```

### Podcast Hooks

#### `usePodcast(id, config)`

```typescript
const { data, isLoading, error } = usePodcast(920666, config);

// data.feed contains the podcast details
```

#### `usePodcastByUrl(url, config)`

```typescript
const { data, isLoading, error } = usePodcastByUrl(
  'https://feeds.example.com/podcast.xml',
  config
);
```

### Episode Hooks

#### `useEpisodes(params, config)`

```typescript
const { data, isLoading, error } = useEpisodes(
  { id: 920666, max: 50 },
  config
);

// data.items contains the episodes
```

### Recent Content Hooks

#### `useRecentEpisodes(max, config)`

```typescript
const { data, isLoading, error } = useRecentEpisodes(20, config);
```

#### `useRecentFeeds(max, config)`

```typescript
const { data, isLoading, error } = useRecentFeeds(10, config);
```

## Response Types

### Podcast Object

```typescript
interface Podcast {
  id: number;
  title: string;
  url: string;                    // RSS feed URL
  originalUrl: string;
  link: string;                   // Website URL
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;         // Unix timestamp
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
  dead: number;                   // 0 = alive, 1 = dead
  crawlErrors: number;
  parseErrors: number;
  categories: Record<string, string>;
  locked: number;                 // 0 = unlocked, 1 = locked
  imageUrlHash: number;
  value?: PodcastValue;           // PC 2.0 value tag
  funding?: PodcastFunding[];     // PC 2.0 funding tags
  guid?: string;                  // PC 2.0 GUID
}
```

### Episode Object

```typescript
interface Episode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;          // Unix timestamp
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;           // Audio file URL
  enclosureType: string;          // MIME type
  enclosureLength: number;        // File size in bytes
  duration: number;               // Duration in seconds
  explicit: number;               // 0 = clean, 1 = explicit
  episode?: number;               // PC 2.0 episode number
  episodeType?: string;           // PC 2.0 episode type
  season?: number;                // PC 2.0 season number
  image: string;
  feedItunesId?: number;
  feedImage: string;
  feedId: number;
  feedTitle: string;
  feedLanguage: string;
  chaptersUrl?: string;           // PC 2.0 chapters URL
  transcriptUrl?: string;         // PC 2.0 transcript URL
  value?: EpisodeValue;           // PC 2.0 value tag
  soundbite?: Soundbite[];        // PC 2.0 soundbites
  persons?: Person[];             // PC 2.0 person tags
  location?: Location;            // PC 2.0 location
  socialInteract?: SocialInteract[]; // PC 2.0 social interact
}
```

### PC 2.0 Types

#### Value4Value

```typescript
interface PodcastValue {
  model: {
    type: string;               // "lightning"
    method: string;             // "keysend"
    suggested?: string;         // Suggested amount
  };
  destinations: ValueDestination[];
}

interface ValueDestination {
  name: string;                 // Recipient name
  type: string;                 // "node"
  address: string;              // Lightning address
  split: number;                // Percentage split
  fee?: boolean;                // Is this a fee?
  customKey?: string;
  customValue?: string;
}
```

#### Person Tags

```typescript
interface Person {
  name: string;                 // Person's name
  role?: string;                // host, guest, producer, etc.
  group?: string;               // Group name
  img?: string;                 // Profile image URL
  href?: string;                // Profile URL
}
```

#### Location

```typescript
interface Location {
  name: string;                 // Location name
  geo?: string;                 // Geo coordinates
  osm?: string;                 // OpenStreetMap ID
}
```

#### Soundbites

```typescript
interface Soundbite {
  startTime: number;            // Start time in seconds
  duration: number;             // Duration in seconds
  title?: string;               // Soundbite title
}
```

## Error Handling

All API methods can throw errors. Handle them appropriately:

```typescript
try {
  const results = await client.searchPodcasts({ q: 'test' });
  // Handle results
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error (show user message, retry, etc.)
}
```

React hooks automatically handle errors and provide them in the return object:

```typescript
const { data, isLoading, error } = useSearchPodcasts(params, config);

if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Rate Limiting

The Podcast Index API has rate limits. The client automatically handles authentication but you should:

1. Cache results when possible
2. Implement retry logic with exponential backoff
3. Use React Query's built-in caching (included in hooks)
4. Respect the API's rate limits

## Best Practices

### 1. Configuration Management

Store API credentials securely:

```typescript
// Environment variables
const config = {
  apiKey: process.env.PODCAST_INDEX_API_KEY,
  apiSecret: process.env.PODCAST_INDEX_API_SECRET,
  userAgent: 'YourApp/1.0',
};
```

### 2. Error Boundaries

Wrap components using the hooks in error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <PodcastSearch config={config} />
</ErrorBoundary>
```

### 3. Loading States

Always handle loading states:

```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### 4. Caching Strategy

Configure React Query for optimal caching:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      cacheTime: 10 * 60 * 1000,    // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

This API reference provides everything you need to integrate with the Podcast Index API effectively.