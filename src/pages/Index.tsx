import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PodcastSearch } from '@/components/podcast/PodcastSearch';
import { Zap, Search, BookOpen, FileText, Users, MapPin, DollarSign } from 'lucide-react';
import type { PodcastIndexConfig } from '@/lib/pc20-types';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [config, setConfig] = useState<PodcastIndexConfig | undefined>();

  useSeoMeta({
    title: 'PC 2.0 Starter Template',
    description: 'Build modern podcast applications with Podcasting 2.0 features like Value4Value, chapters, transcripts, and more.',
  });

  const handleConfigSubmit = () => {
    if (apiKey && apiSecret) {
      setConfig({
        apiKey,
        apiSecret,
        userAgent: 'PC20Starter/1.0',
      });
    }
  };

  const pc20Features = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      title: 'Value4Value',
      description: 'Lightning Network micropayments to creators',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      title: 'Chapters',
      description: 'Structured episode navigation',
    },
    {
      icon: <FileText className="w-5 h-5 text-green-500" />,
      title: 'Transcripts',
      description: 'Searchable, accessible episode transcripts',
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      title: 'Person Tags',
      description: 'Credit hosts, guests, and production team',
    },
    {
      icon: <MapPin className="w-5 h-5 text-red-500" />,
      title: 'Location',
      description: 'Geographic context for episodes',
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      title: 'Funding',
      description: 'Support links and donation options',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            PC 2.0 Starter Template
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build modern podcast applications with Podcasting 2.0 features
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="text-sm">React 18</Badge>
            <Badge variant="secondary" className="text-sm">TypeScript</Badge>
            <Badge variant="secondary" className="text-sm">Podcast Index API</Badge>
            <Badge variant="secondary" className="text-sm">PC 2.0 Support</Badge>
          </div>
        </div>

        {/* PC 2.0 Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Podcasting 2.0 Features
            </CardTitle>
            <CardDescription>
              This template includes support for all major PC 2.0 features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pc20Features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {feature.icon}
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        {!config ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Enter your Podcast Index API credentials to start exploring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Get your free API credentials at{' '}
                  <a
                    href="https://api.podcastindex.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    api.podcastindex.org
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Secret</label>
                  <Input
                    type="password"
                    placeholder="Enter your API secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleConfigSubmit}
                disabled={!apiKey || !apiSecret}
                className="w-full"
              >
                Start Exploring
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Podcast Search */}
            <PodcastSearch config={config} />

            {/* Enhanced RSS Demo */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Enhanced RSS Parser Features</CardTitle>
                <CardDescription>
                  Advanced RSS parsing capabilities from the FUCKIT project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This template now includes enhanced RSS parsing features with batch processing,
                  publisher feed aggregation, advanced error handling, and more.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <Badge variant="outline">Batch Processing</Badge>
                  <Badge variant="outline">Cover Art Fallbacks</Badge>
                  <Badge variant="outline">Duration Conversion</Badge>
                  <Badge variant="outline">Publisher Aggregation</Badge>
                  <Badge variant="outline">Error Handling</Badge>
                  <Badge variant="outline">HTML Cleaning</Badge>
                  <Badge variant="outline">Retry Logic</Badge>
                  <Badge variant="outline">Performance Optimized</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
            <CardDescription>
              Learn more about Podcasting 2.0 and this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto p-4">
                <a href="/docs/PODCASTING-2.0.md" target="_blank">
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">PC 2.0 Guide</div>
                    <div className="text-xs text-muted-foreground">
                      Complete overview of features
                    </div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4">
                <a href="/docs/API-REFERENCE.md" target="_blank">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">API Reference</div>
                    <div className="text-xs text-muted-foreground">
                      Integration guide
                    </div>
                  </div>
                </a>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4">
                <a href="/docs/EXAMPLES.md" target="_blank">
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Examples</div>
                    <div className="text-xs text-muted-foreground">
                      Practical implementations
                    </div>
                  </div>
                </a>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">External Resources</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://podcastindex.org" target="_blank" rel="noopener noreferrer">
                    Podcast Index
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com/Podcastindex-org/podcast-namespace" target="_blank" rel="noopener noreferrer">
                    PC 2.0 Namespace
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://podcastindex.org/apps" target="_blank" rel="noopener noreferrer">
                    PC 2.0 Apps
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://discord.gg/podcastindex" target="_blank" rel="noopener noreferrer">
                    Discord Community
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Built for the Podcasting 2.0 ecosystem 🎙️⚡
          </p>
          <p className="mt-1">
            Template by{' '}
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MKStack
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
