import { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Loader2, Filter, Monitor, Smartphone } from 'lucide-react';

interface VideoItem {
  id: number;
  tags: string;
  pageURL: string;
  videos: {
    small: { url: string; width: number; height: number; thumbnail: string };
    medium: { url: string; width: number; height: number; thumbnail: string };
    large: { url: string; width: number; height: number; thumbnail: string };
  };
  duration: number;
  views: number;
  downloads: number;
  likes: number;
  user: string;
}

export default function VideoStocks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}&per_page=24`);
      const data = await res.json();
      setResults(data.hits || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    handleSearch('nature video');
  }, []);

  const togglePlay = (item: VideoItem) => {
    const video = videoRefs.current.get(item.id);
    if (!video) return;

    if (playingId === item.id) {
      video.pause();
      setPlayingId(null);
    } else {
      videoRefs.current.forEach((v, id) => {
        if (id !== item.id) v.pause();
      });
      video.play();
      setPlayingId(item.id);
    }
  };

  const filtered = results.filter((item) => {
    if (filter === 'all') return true;
    const w = item.videos.large.width;
    const h = item.videos.large.height;
    if (filter === 'vertical') return h > w;
    if (filter === 'horizontal') return w >= h;
    return true;
  });

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Видео-стоки</h1>
        <p className="text-text-secondary">Бесплатные видео с Wikimedia Commons для вашего контента</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск видео... (например: nature, city, food)"
            className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Найти'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-text-muted" />
        {[
          { id: 'all' as const, label: 'Все', icon: Monitor },
          { id: 'horizontal' as const, label: 'Горизонтальные', icon: Monitor },
          { id: 'vertical' as const, label: 'Вертикальные (Reels/Stories)', icon: Smartphone },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-dark-700 text-text-muted border border-border hover:text-white'
            }`}
          >
            <f.icon className="w-3 h-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isVertical = item.videos.large.height > item.videos.large.width;
            return (
              <div key={item.id} className="bento-item group overflow-hidden">
                <div className={`relative bg-dark-600 ${isVertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
                  <video
                    ref={(el) => { if (el) videoRefs.current.set(item.id, el); }}
                    src={item.videos.medium.url}
                    poster={item.videos.small.thumbnail}
                    muted
                    loop
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />

                  {/* Play button overlay */}
                  <button
                    onClick={() => togglePlay(item)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {playingId === item.id ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </div>
                  </button>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs font-mono">
                    {formatDuration(item.duration)}
                  </div>

                  {/* Vertical badge */}
                  {isVertical && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 rounded text-xs font-medium flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Reels
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {item.tags.split(',').slice(0, 2).join(', ')}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-text-muted">
                    <span>{item.user || 'Wikimedia'}</span>
                    <span>{item.videos.large.width}×{item.videos.large.height}</span>
                  </div>
                  <a
                    href={item.pageURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-primary hover:text-primary-light transition-colors"
                  >
                    Скачать с Wikimedia →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Play className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <p className="text-text-muted">Ничего не найдено. Попробуйте другой запрос.</p>
        </div>
      )}
    </div>
  );
}
