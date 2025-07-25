# PC 2.0 Starter Template

A comprehensive starter template for building Podcasting 2.0 applications with modern web technologies. This template provides everything you need to create podcast apps with support for the latest PC 2.0 features like Value4Value payments, chapters, transcripts, and more.

## 🎯 What is Podcasting 2.0?

Podcasting 2.0 is an initiative to evolve podcasting with new features while maintaining backward compatibility. It introduces RSS namespace extensions that enable:

- **Value4Value**: Lightning Network micropayments to creators
- **Chapters**: Structured episode navigation
- **Transcripts**: Searchable, accessible episode transcripts
- **Person Tags**: Credit hosts, guests, and production team
- **Location**: Geographic context for episodes
- **Soundbites**: Shareable episode highlights
- **Social Interact**: Decentralized comments and engagement

## 🚀 Features

### Core Technologies
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and builds
- **TailwindCSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible components
- **React Query** for data fetching and caching
- **React Router** for client-side navigation

### Podcasting 2.0 Integration
- **Podcast Index API** client with full TypeScript support
- **RSS Parser** with PC 2.0 namespace support
- **React Hooks** for podcast data fetching
- **UI Components** for podcasts, episodes, and players
- **Value4Value** payment integration examples
- **Chapter Navigation** and transcript display
- **PC 2.0 Feature Detection** and validation

### Developer Experience
- **Comprehensive Documentation** with examples
- **TypeScript Types** for all PC 2.0 features
- **Testing Setup** with Vitest and Testing Library
- **ESLint Configuration** with custom rules
- **Error Handling** and loading states

## 📚 Documentation

- **[Podcasting 2.0 Guide](docs/PODCASTING-2.0.md)** - Complete overview of PC 2.0 features
- **[API Reference](docs/API-REFERENCE.md)** - Podcast Index API integration guide
- **[Implementation Examples](docs/EXAMPLES.md)** - Practical code examples

## 🏗️ Quick Start

### 1. Get API Credentials

Visit [api.podcastindex.org](https://api.podcastindex.org/) to get your free API key and secret.

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd pc20-starter
npm install
```

### 3. Configure API

Create a `.env.local` file:

```env
VITE_PODCAST_INDEX_API_KEY=your_api_key_here
VITE_PODCAST_INDEX_API_SECRET=your_api_secret_here
```

### 4. Start Development

```bash
npm run dev
```

### 5. Build Your App

```typescript
import { useSearchPodcasts } from '@/hooks/usePodcastIndex';
import { PodcastGrid } from '@/components/podcast/PodcastCard';

function MyPodcastApp() {
  const config = {
    apiKey: import.meta.env.VITE_PODCAST_INDEX_API_KEY,
    apiSecret: import.meta.env.VITE_PODCAST_INDEX_API_SECRET,
    userAgent: 'MyApp/1.0',
  };

  const { data, isLoading } = useSearchPodcasts(
    { q: 'technology', max: 20 },
    config
  );

  return (
    <div>
      {data?.feeds && (
        <PodcastGrid podcasts={data.feeds} showDetails={true} />
      )}
    </div>
  );
}
```

## 🧩 Key Components

### Podcast Search
```typescript
import { PodcastSearch } from '@/components/podcast/PodcastSearch';

<PodcastSearch
  config={apiConfig}
  onSelectPodcast={(podcast) => navigate(`/podcast/${podcast.id}`)}
/>
```

### Episode Player
```typescript
import { EpisodeCard } from '@/components/podcast/EpisodeCard';

<EpisodeCard
  episode={episode}
  onPlay={(episode) => playEpisode(episode)}
  showDetails={true}
/>
```

### RSS Feed Parser
```typescript
import { parsePC20Feed, getPC20Features } from '@/lib/rssParser';

const feed = await parsePC20Feed('https://example.com/feed.xml');
const features = getPC20Features(feed); // ['Value4Value', 'Chapters', 'Transcripts']
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests with Vitest
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── podcast/         # Podcast-specific components
├── hooks/               # React hooks for podcast data
├── lib/                 # Core utilities and API clients
│   ├── podcastIndex.ts  # Podcast Index API client
│   ├── rssParser.ts     # PC 2.0 RSS parser
│   └── pc20-types.ts    # TypeScript types
├── pages/               # Page components
└── docs/                # Documentation
```

## 🎨 Customization

This template is designed to be customized for your specific use case:

### Podcast Discovery App
- Focus on search and discovery features
- Implement recommendation algorithms
- Add social features and user profiles

### Podcast Player
- Build a full-featured audio player
- Add playlist and queue management
- Implement offline downloading

### Creator Tools
- RSS feed generator with PC 2.0 support
- Analytics and listener insights
- Monetization and payment tools

### Directory/Aggregator
- Curated podcast collections
- Category and tag-based browsing
- Editorial features and reviews

## 🌟 PC 2.0 Features Included

### ✅ Implemented
- [x] Podcast Index API integration
- [x] RSS parsing with PC 2.0 namespace support
- [x] TypeScript types for all PC 2.0 features
- [x] Basic UI components for podcasts and episodes
- [x] Search and discovery functionality
- [x] Chapter and transcript support
- [x] Value4Value payment examples

### 🚧 Ready to Implement
- [ ] Audio player with chapter navigation
- [ ] Lightning wallet integration (WebLN)
- [ ] Transcript search and highlighting
- [ ] Social features and comments
- [ ] Offline support and caching
- [ ] Push notifications for new episodes

## 🤝 Contributing

This is a starter template - fork it and make it your own! If you build something cool, consider sharing it with the Podcasting 2.0 community.

## 📖 Learn More

- [Podcasting 2.0 Podcast](https://podcastindex.org/podcast/920666)
- [Podcast Index Discord](https://discord.gg/podcastindex)
- [GitHub: Podcast Namespace](https://github.com/Podcastindex-org/podcast-namespace)
- [PC 2.0 Apps Directory](https://podcastindex.org/apps)

## 📄 License

MIT License - feel free to use this template for any project, commercial or personal.

---

**Built for the Podcasting 2.0 ecosystem** 🎙️⚡