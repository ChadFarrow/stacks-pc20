# Podcasting 2.0 Guide

This guide covers the Podcasting 2.0 ecosystem, its features, and how to implement them in your applications.

## What is Podcasting 2.0?

Podcasting 2.0 is an initiative to evolve podcasting with new features and capabilities while maintaining backward compatibility with existing podcast players and infrastructure. It introduces new RSS namespace tags that enable enhanced functionality like micropayments, chapters, transcripts, and more.

## Key Resources

- **Official Website**: [podcastindex.org](https://podcastindex.org)
- **GitHub Organization**: [github.com/Podcastindex-org](https://github.com/Podcastindex-org)
- **Podcast Namespace Spec**: [github.com/Podcastindex-org/podcast-namespace](https://github.com/Podcastindex-org/podcast-namespace)
- **API Documentation**: [podcastindex-org.github.io/docs-api](https://podcastindex-org.github.io/docs-api/)
- **Apps & Services**: [podcastindex.org/apps](https://podcastindex.org/apps)

## Core Features

### 1. Value4Value (Lightning Payments)

Enable micropayments to podcasters using Bitcoin Lightning Network.

**RSS Tag**: `<podcast:value>`

```xml
<podcast:value type="lightning" method="keysend" suggested="0.00000005000">
  <podcast:valueRecipient name="Alice" type="node" address="02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee4c7e839e33bef9174531d27f52" split="40" />
  <podcast:valueRecipient name="Bob" type="node" address="032f4ffbbafffbe51726ad3c164a3d0d37ec27bc67b29a159b0f49ae8ac21b8508" split="60" />
</podcast:value>
```

**Implementation**:
- Integrate with Lightning wallets (Alby, WebLN)
- Support streaming sats during playback
- Display value splits to users

### 2. Chapters

Provide structured navigation within episodes.

**RSS Tag**: `<podcast:chapters>`

```xml
<podcast:chapters url="https://example.com/episode1/chapters.json" type="application/json+chapters" />
```

**Chapter JSON Format**:
```json
{
  "version": "1.2.0",
  "chapters": [
    {
      "startTime": 0,
      "title": "Intro",
      "img": "https://example.com/intro.jpg",
      "url": "https://example.com/intro"
    },
    {
      "startTime": 120,
      "title": "Main Topic",
      "img": "https://example.com/topic.jpg"
    }
  ]
}
```

### 3. Transcripts

Provide searchable, accessible transcripts.

**RSS Tag**: `<podcast:transcript>`

```xml
<podcast:transcript url="https://example.com/episode1/transcript.json" type="application/json" />
<podcast:transcript url="https://example.com/episode1/transcript.srt" type="text/srt" />
<podcast:transcript url="https://example.com/episode1/transcript.vtt" type="text/vtt" />
```

**Supported Formats**:
- JSON (structured with timestamps)
- SRT (SubRip)
- VTT (WebVTT)
- HTML

### 4. Person Tags

Credit people involved in podcast production.

**RSS Tag**: `<podcast:person>`

```xml
<podcast:person role="host" img="https://example.com/alice.jpg" href="https://alice.example.com">Alice Johnson</podcast:person>
<podcast:person role="guest" group="guests">Bob Smith</podcast:person>
<podcast:person role="producer">Charlie Brown</podcast:person>
```

**Common Roles**:
- host, co-host, guest
- producer, editor, engineer
- composer, musician, narrator

### 5. Location

Add geographic context to episodes.

**RSS Tag**: `<podcast:location>`

```xml
<podcast:location geo="geo:40.7589,-73.9851" osm="R175905">New York City</podcast:location>
```

### 6. Soundbites

Highlight key moments for sharing.

**RSS Tag**: `<podcast:soundbite>`

```xml
<podcast:soundbite startTime="73.0" duration="60.0">The most important point of the episode</podcast:soundbite>
```

### 7. Social Interact

Enable social features and comments.

**RSS Tag**: `<podcast:socialInteract>`

```xml
<podcast:socialInteract uri="https://podcastindex.social/@dave/108013847520053258" protocol="activitypub" />
<podcast:socialInteract uri="https://twitter.com/PodcastindexOrg/status/1507120226361647115" protocol="twitter" />
```

### 8. Funding

Display funding/donation information.

**RSS Tag**: `<podcast:funding>`

```xml
<podcast:funding url="https://paypal.me/example">Support the show</podcast:funding>
<podcast:funding url="https://patreon.com/example">Become a patron</podcast:funding>
```

### 9. Locked

Prevent unauthorized feed modifications.

**RSS Tag**: `<podcast:locked>`

```xml
<podcast:locked owner="john@example.com">yes</podcast:locked>
```

### 10. GUID

Provide a permanent, unique identifier.

**RSS Tag**: `<podcast:guid>`

```xml
<podcast:guid>ead4c236-bf58-58c6-a2c6-a6b28d128cb6</podcast:guid>
```

## Implementation Best Practices

### 1. Progressive Enhancement

Start with basic RSS and add PC 2.0 features incrementally:

1. **Basic RSS**: Title, description, enclosure
2. **Core PC 2.0**: GUID, locked, funding
3. **Enhanced Features**: Chapters, transcripts, value
4. **Advanced Features**: Social interact, location, soundbites

### 2. Validation

Always validate PC 2.0 feeds:

- Use the [Podcast Namespace Validator](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/element-docs/value/value.md)
- Test with PC 2.0 compatible apps
- Validate JSON chapter and transcript files

### 3. Backward Compatibility

Ensure your feeds work with legacy players:

- Keep standard RSS elements
- Use PC 2.0 tags as enhancements only
- Provide fallbacks for critical information

### 4. User Experience

Design with PC 2.0 features in mind:

- Show chapter navigation prominently
- Make transcripts searchable
- Display value splits transparently
- Highlight PC 2.0 features with badges

## Development Tools

### RSS Feed Generators

- **Podcast Generator**: Create PC 2.0 compliant feeds
- **Namespace Validator**: Validate PC 2.0 tags
- **Feed Analyzer**: Analyze existing feeds for PC 2.0 support

### Testing Tools

- **PC 2.0 Apps**: Test with Fountain, Podverse, Curiocaster
- **Feed Validators**: RSS and PC 2.0 specific validators
- **Lightning Testnet**: Test value features safely

### Libraries and SDKs

- **JavaScript**: This starter template
- **Python**: `python-podcastindex`
- **PHP**: `podcastindex-php`
- **Go**: `podcastindex-go`

## Getting Started Checklist

### For Podcasters

- [ ] Get Podcast Index API credentials
- [ ] Add `<podcast:guid>` to your feed
- [ ] Implement `<podcast:locked>` for security
- [ ] Add `<podcast:funding>` links
- [ ] Create chapter files for episodes
- [ ] Generate transcripts
- [ ] Set up Lightning wallet for value4value

### For Developers

- [ ] Study the podcast namespace specification
- [ ] Get Podcast Index API access
- [ ] Implement RSS parsing with PC 2.0 support
- [ ] Add Lightning payment integration
- [ ] Build chapter navigation UI
- [ ] Implement transcript search
- [ ] Test with PC 2.0 compatible apps

### For App Developers

- [ ] Support PC 2.0 namespace tags
- [ ] Implement value4value payments
- [ ] Add chapter navigation
- [ ] Support transcript display/search
- [ ] Show person credits
- [ ] Display funding options
- [ ] Implement social features

## Common Use Cases

### Podcast Discovery App

```typescript
// Search for podcasts with value4value
const podcasts = await podcastIndex.searchPodcasts({
  q: "technology",
  val: "lightning",
  max: 20
});

// Filter for PC 2.0 features
const pc20Podcasts = podcasts.feeds?.filter(podcast => 
  podcast.value || podcast.funding?.length > 0
);
```

### Episode Player

```typescript
// Load episode with chapters
const episode = await podcastIndex.getEpisodeById(episodeId);

if (episode.chaptersUrl) {
  const chapters = await fetch(episode.chaptersUrl).then(r => r.json());
  // Implement chapter navigation
}

if (episode.transcriptUrl) {
  const transcript = await fetch(episode.transcriptUrl).then(r => r.text());
  // Implement transcript search and display
}
```

### Value4Value Integration

```typescript
// Set up Lightning payments
if (episode.value) {
  const destinations = episode.value.destinations;
  // Split payments according to value splits
  destinations.forEach(dest => {
    sendPayment(dest.address, amount * (dest.split / 100));
  });
}
```

## Resources for Learning More

### Documentation

- [Podcast Namespace Documentation](https://github.com/Podcastindex-org/podcast-namespace/tree/main/docs)
- [Value4Value Specification](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/element-docs/value/value.md)
- [Chapter Format Specification](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/element-docs/chapters/chapters.md)

### Community

- [Podcast Index Discord](https://discord.gg/podcastindex)
- [Podcasting 2.0 Podcast](https://podcastindex.org/podcast/920666)
- [GitHub Discussions](https://github.com/Podcastindex-org/podcast-namespace/discussions)

### Example Implementations

- [Podcast Index Web Player](https://github.com/Podcastindex-org/web-player)
- [Podverse](https://github.com/podverse/podverse-web)
- [Fountain](https://www.fountain.fm/)

This guide provides a foundation for understanding and implementing Podcasting 2.0 features. The ecosystem is rapidly evolving, so stay connected with the community for the latest developments.