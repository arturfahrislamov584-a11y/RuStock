import { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, Grid3X3, LayoutGrid, Download,
  Heart, X, Eye, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { searchPixabay, getPixabayPopular, pixabayToStock } from '../lib/pixabay';
import { useStore } from '../store/useStore';

type StockItem = ReturnType<typeof pixabayToStock>;

const categoryMap: Record<string, string> = {
  all: '',
  business: 'business',
  technology: 'computer',
  nature: 'nature',
  people: 'people',
  food: 'food',
  travel: 'travel',
  fashion: 'fashion',
  architecture: 'building',
  abstract: 'abstract',
};

const categoryLabels = [
  { id: 'all', name: 'Все' },
  { id: 'business', name: 'Бизнес' },
  { id: 'technology', name: 'Технологии' },
  { id: 'nature', name: 'Природа' },
  { id: 'people', name: 'Люди' },
  { id: 'food', name: 'Еда' },
  { id: 'travel', name: 'Путешествия' },
  { id: 'fashion', name: 'Мода' },
  { id: 'architecture', name: 'Архитектура' },
  { id: 'abstract', name: 'Абстракция' },
];

export default function Catalog() {
  const { searchQuery, setSearchQuery, favorites, toggleFavorite } = useStore();
  const [results, setResults] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [previewItem, setPreviewItem] = useState<StockItem | null>(null);

  const doSearch = useCallback(async (query: string, pageNum: number, category: string) => {
    setLoading(true);
    try {
      const cat = categoryMap[category] || '';
      const q = query || cat || 'popular';

      const data = query || cat
        ? await searchPixabay(q, pageNum, 20, cat)
        : await getPixabayPopular(pageNum, 20);

      setResults(data.hits.map(pixabayToStock));
      setTotalPages(Math.ceil(data.totalHits / 20));
      setTotalResults(data.totalHits);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setTotalResults(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    doSearch('', 1, 'all');
  }, [doSearch]);

  const handleSearch = () => {
    setPage(1);
    setSelectedCategory('all');
    doSearch(searchQuery, 1, 'all');
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    setSearchQuery('');
    doSearch('', 1, cat);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doSearch(searchQuery || '', newPage, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск миллионов фото... например: бизнес, природа, технология"
            className="w-full pl-12 pr-20 py-3.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); handleSearch(); }}
                className="p-1.5 text-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {categoryLabels.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-text-secondary hover:text-white hover:bg-dark-600 border border-border'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-dark-700 border-border text-text-secondary hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Фильтры</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted hidden sm:inline">
            {totalResults.toLocaleString()} результатов
          </span>
          <div className="hidden sm:flex items-center gap-1 bg-dark-700 border border-border rounded-lg p-1">
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded ${gridCols === 4 ? 'bg-dark-500 text-white' : 'text-text-muted'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded ${gridCols === 3 ? 'bg-dark-500 text-white' : 'text-text-muted'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm text-text-muted">Загрузка результатов...</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className={`grid gap-3 ${
            gridCols === 4
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-2 md:grid-cols-3'
          }`}>
            {results.map((item) => (
              <div key={item.id} className="bento-item group relative">
                <div className="aspect-[4/3] overflow-hidden bg-dark-600 relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        favorites.includes(item.id)
                          ? 'bg-primary text-white'
                          : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setPreviewItem(item); }}
                      className="w-8 h-8 rounded-lg bg-black/50 text-white/70 hover:text-white hover:bg-black/70 flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-accent-green bg-accent-green/20 px-2 py-0.5 rounded-full">Бесплатно</span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Скачать
                    </a>
                  </div>
                </div>

                <div className="p-3">
                  <h3
                    className="text-sm font-medium truncate hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setPreviewItem(item)}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted">{item.author}</span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {item.downloads.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-dark-700 border border-border text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-primary text-white'
                        : 'bg-dark-700 border border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-dark-700 border border-border text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ничего не найдено</h3>
          <p className="text-sm text-text-muted">Попробуйте изменить запрос</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-dark-800 border border-border rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-dark-700">
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="w-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{previewItem.title}</h2>
              <p className="text-sm text-text-secondary mb-3">{previewItem.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {previewItem.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-dark-600 text-xs text-text-muted rounded-lg cursor-pointer hover:text-primary hover:bg-dark-500 transition-colors"
                    onClick={() => { setSearchQuery(tag); setPreviewItem(null); handleSearch(); }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span>{previewItem.width}x{previewItem.height}</span>
                  <span>Автор: {previewItem.author}</span>
                  <span>{previewItem.downloads.toLocaleString()} скачиваний</span>
                  <span>{previewItem.likes.toLocaleString()} лайков</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-accent-green">Бесплатно</span>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Скачать
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
