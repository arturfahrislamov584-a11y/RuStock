import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Heart, Zap,
  Tag, ChevronRight, Shield, Copy, Loader2, ExternalLink
} from 'lucide-react';
import { searchPixabay, pixabayToStock } from '../lib/pixabay';
import { useStore } from '../store/useStore';

type StockItem = ReturnType<typeof pixabayToStock>;

export default function ContentDetail() {
  const { id } = useParams();
  const { favorites, toggleFavorite, setSearchQuery } = useStore();
  const [item, setItem] = useState<StockItem | null>(null);
  const [related, setRelated] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    searchPixabay(id, 1, 5)
      .then((data) => {
        const found = data.hits.find((h) => String(h.id) === id);
        const converted = found ? pixabayToStock(found) : null;
        setItem(converted);

        const others = data.hits.filter((h) => String(h.id) !== id).slice(0, 4);
        setRelated(others.map(pixabayToStock));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-text-muted">Контент не найден</p>
        <Link to="/catalog" className="text-primary text-sm mt-2 inline-block">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/catalog" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />Каталог
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate">{item.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bento-item overflow-hidden">
            <div className="bg-dark-700">
              <img src={item.url} alt={item.title} className="w-full object-contain max-h-[70vh]" />
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
            <p className="text-text-secondary leading-relaxed">Фотография от {item.author} на Pixabay</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.map((tag: string) => (
              <Link
                key={tag}
                to={`/catalog?search=${tag}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 border border-border rounded-lg text-xs text-text-secondary hover:text-white hover:border-primary transition-colors"
              >
                <Tag className="w-3 h-3" />{tag}
              </Link>
            ))}
          </div>

          <div className="mt-6 bento-item p-5">
            <h3 className="text-sm font-semibold mb-3">Статистика</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Разрешение', value: `${item.width}x${item.height}` },
                { label: 'Просмотры', value: item.views.toLocaleString() },
                { label: 'Скачиваний', value: item.downloads.toLocaleString() },
                { label: 'Лайков', value: item.likes.toLocaleString() },
              ].map((spec) => (
                <div key={spec.label} className="bg-dark-600 rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">{spec.label}</div>
                  <div className="text-sm font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bento-item p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-accent-green">Бесплатно</span>
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  favorites.includes(item.id)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-dark-600 text-text-muted hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Download className="w-4 h-4" />
              Скачать с Pixabay
            </a>

            <a
              href={item.pageURL}
              target="_blank"
              rel="noopener"
              className="w-full py-2.5 bg-dark-600 hover:bg-dark-500 text-text-secondary text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть на Pixabay
            </a>

            <div className="space-y-2.5 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Shield className="w-4 h-4 text-accent-green shrink-0" />
                Pixabay License (бесплатно)
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Download className="w-4 h-4 text-accent-blue shrink-0" />
                Коммерческое использование
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Copy className="w-4 h-4 text-accent-yellow shrink-0" />
                Без указания автора
              </div>
            </div>
          </div>

          <div className="bento-item p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {item.author[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{item.author}</div>
                <div className="text-xs text-text-muted">{item.downloads.toLocaleString()} скачиваний</div>
              </div>
            </div>
            <button
              onClick={() => { setSearchQuery(item.author); }}
              className="w-full text-center py-2 bg-dark-600 hover:bg-dark-500 text-sm text-text-secondary rounded-lg transition-colors"
            >
              Все работы автора
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Похожие фотографии</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((r) => (
              <Link key={r.id} to={`/catalog/${r.id}`} className="bento-item group">
                <div className="aspect-[4/3] overflow-hidden bg-dark-600">
                  <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{r.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-accent-yellow">
                    <Zap className="w-3 h-3" />{r.credits}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
