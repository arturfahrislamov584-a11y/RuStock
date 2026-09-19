import { useState, useRef } from 'react';
import {
  Wand2, Image, Layers, Maximize2, Palette, Sparkles,
  Loader2, Download, AlertCircle, Zap, Upload
} from 'lucide-react';
import { useStore } from '../store/useStore';

const tools = [
  {
    id: 'infographic',
    title: 'Авто-инфографика',
    desc: 'Загрузите фото товара — ИИ создаст инфографику с плашками и характеристиками',
    icon: Image,
    color: 'text-primary',
    bg: 'bg-primary/10',
    credits: 3,
  },
  {
    id: 'batch-bg',
    title: 'Пакетная замена фона',
    desc: 'Загрузите до 30 фото и замените фон одним кликом для единого стиля карточек',
    icon: Layers,
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    credits: 2,
  },
  {
    id: 'magic-resize',
    title: 'Magic Resizer',
    desc: 'Расширение кадра: из квадрата — в Stories, из баннера — в горизонтальный формат',
    icon: Maximize2,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    credits: 2,
  },
  {
    id: 'bg-swapper',
    title: 'Замена фона товара',
    desc: 'Один клик — товар на новом фоне: студия, природa, интерьер',
    icon: Palette,
    color: 'text-accent-yellow',
    bg: 'bg-accent-yellow/10',
    credits: 2,
  },
];

const bgPresets = [
  'чистая белая студия',
  'минималистичная бежевая студия',
  'тёмный элегантный фон',
  'мраморная поверхность',
  'деревянный стол',
  'новогодний интерьер',
  'летний пляж',
  'космический фон',
  'градиентный фон',
];

export default function Tools() {
  const { credits } = useStore();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Infographic
  const [infoPrompt, setInfoPrompt] = useState('');

  // Batch BG
  const [batchUrls, setBatchUrls] = useState('');
  const [batchBg, setBatchBg] = useState('чистая белая студия');
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // Magic Resize
  const [resizePrompt, setResizePrompt] = useState('');
  const [resizeFormat, setResizeFormat] = useState<'stories' | 'banner' | 'square'>('stories');

  // BG Swapper
  const [bgPrompt, setBgPrompt] = useState('');
  const [selectedBg, setSelectedBg] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Только изображения'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setBgPrompt(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Только изображения'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setBgPrompt(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runTool = async (toolId: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    setBatchResults([]);

    try {
      let res: Response;

      switch (toolId) {
        case 'infographic':
          if (!infoPrompt.trim()) { setError('Опишите товар'); setLoading(false); return; }
          res = await fetch('/api/tools/infographic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('rustok_token')}` },
            body: JSON.stringify({ prompt: infoPrompt, imageBase64: uploadedImage || null, width: '1024', height: '1024' }),
          });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
          const blob1 = await res.blob();
          setResult(URL.createObjectURL(blob1));
          break;

        case 'batch-bg':
          const urls = batchUrls.split('\n').map((u) => u.trim()).filter(Boolean);
          if (urls.length === 0) { setError('Вставьте URL изображений'); setLoading(false); return; }
          res = await fetch('/api/tools/batch-background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('rustok_token')}` },
            body: JSON.stringify({ imageUrls: urls, background: batchBg }),
          });
          const d2 = await res.json();
          if (!res.ok) throw new Error(d2.error);
          setBatchResults(d2.results);
          break;

        case 'magic-resize':
          if (!resizePrompt.trim()) { setError('Опишите сцену'); setLoading(false); return; }
          const dims = resizeFormat === 'stories' ? { w: '1024', h: '1792' } : resizeFormat === 'banner' ? { w: '1792', h: '1024' } : { w: '1024', h: '1024' };
          res = await fetch('/api/tools/magic-resize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('rustok_token')}` },
            body: JSON.stringify({ prompt: resizePrompt, imageBase64: uploadedImage || null, targetWidth: dims.w, targetHeight: dims.h }),
          });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
          const blob3 = await res.blob();
          setResult(URL.createObjectURL(blob3));
          break;

        case 'bg-swapper':
          if (!bgPrompt.trim() && !uploadedImage) { setError('Опишите изображение'); setLoading(false); return; }
          const bgDesc = selectedBg || bgPrompt;
          res = await fetch('/api/tools/background-remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('rustok_token')}` },
            body: JSON.stringify({ imageUrl: uploadedImage || bgPrompt, background: bgDesc }),
          });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
          const blob4 = await res.blob();
          setResult(URL.createObjectURL(blob4));
          break;
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    }
    setLoading(false);
  };

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-4">
          <Wand2 className="w-4 h-4" />
          AI-инструменты
        </div>
        <h1 className="text-3xl font-bold mb-2">Умные инструменты</h1>
        <p className="text-text-secondary">Для селлеров маркетплейсов, SMM-щиков и дизайнеров</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool list */}
        <div className="space-y-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setResult(null); setError(''); setBatchResults([]); }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeTool === tool.id
                  ? 'bg-dark-700 border-primary/50 glow-red'
                  : 'bg-dark-700/50 border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${tool.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{tool.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{tool.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-accent-yellow">
                    <Zap className="w-3 h-3" />
                    {tool.credits} кредитов
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tool workspace */}
        <div className="lg:col-span-2">
          {!activeTool ? (
            <div className="bento-item p-12 text-center">
              <Sparkles className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Выберите инструмент</h3>
              <p className="text-sm text-text-muted">Нажмите на инструмент слева, чтобы начать работу</p>
            </div>
          ) : (
            <div className="bento-item p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {tools.find((t) => t.id === activeTool)?.title}
                </h2>
                <div className="text-xs text-text-muted">
                  Баланс: <span className="text-accent-yellow font-bold">{credits}</span> кредитов
                </div>
              </div>

              {/* Infographic */}
              {activeTool === 'infographic' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Загрузите фото товара (необязательно)</label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Загруженное" className="max-h-32 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-text-muted mx-auto mb-1" />
                          <p className="text-xs text-text-muted">Перетащите фото или нажмите для выбора</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Опишите товар</label>
                    <textarea
                      value={infoPrompt}
                      onChange={(e) => setInfoPrompt(e.target.value)}
                      placeholder="Красная зимняя куртка, размер M, 100% полиэстер, водонепроницаемая, топ продаж"
                      className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none h-24"
                    />
                  </div>
                  <button
                    onClick={() => runTool('infographic')}
                    disabled={loading || !infoPrompt.trim()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? 'Генерация...' : 'Создать инфографику (3 кредитов)'}
                  </button>
                </div>
              )}

              {/* Batch BG */}
              {activeTool === 'batch-bg' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">URL изображений (по одному на строку, до 30)</label>
                    <textarea
                      value={batchUrls}
                      onChange={(e) => setBatchUrls(e.target.value)}
                      placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg\nhttps://example.com/photo3.jpg"}
                      className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none h-32 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Фон</label>
                    <div className="flex flex-wrap gap-2">
                      {bgPresets.map((bg) => (
                        <button
                          key={bg}
                          onClick={() => { setBatchBg(bg); setSelectedBg(bg); }}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            batchBg === bg
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-dark-600 text-text-muted border-border hover:text-white'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => runTool('batch-bg')}
                    disabled={loading || !batchUrls.trim()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    {loading ? `Обработка... (${batchUrls.split('\n').filter((u) => u.trim()).length} фото)` : `Заменить фон (${batchUrls.split('\n').filter((u) => u.trim()).length * 2} кредитов)`}
                  </button>
                </div>
              )}

              {/* Magic Resize */}
              {activeTool === 'magic-resize' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Загрузите фото для расширения (необязательно)</label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Загруженное" className="max-h-32 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-text-muted mx-auto mb-1" />
                          <p className="text-xs text-text-muted">Перетащите фото или нажмите для выбора</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Опишите сцену для расширения</label>
                    <textarea
                      value={resizePrompt}
                      onChange={(e) => setResizePrompt(e.target.value)}
                      placeholder="Красивый пейзаж гор, облака на фоне, золотой час"
                      className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none h-20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Целевой формат</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'stories' as const, label: 'Stories/Reels (9:16)', icon: '📱' },
                        { id: 'banner' as const, label: 'Баннер (16:9)', icon: '🖥️' },
                        { id: 'square' as const, label: 'Квадрат (1:1)', icon: '⬜' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setResizeFormat(f.id)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${
                            resizeFormat === f.id
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-dark-600 text-text-muted border-border hover:text-white'
                          }`}
                        >
                          <span>{f.icon}</span> {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => runTool('magic-resize')}
                    disabled={loading || !resizePrompt.trim()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize2 className="w-4 h-4" />}
                    {loading ? 'Расширение...' : 'Расширить кадр (2 кредитов)'}
                  </button>
                </div>
              )}

              {/* BG Swapper */}
              {activeTool === 'bg-swapper' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">Загрузите фото товара</label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Загруженное" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                          <p className="text-sm text-text-muted">Перетащите фото сюда или нажмите для выбора</p>
                          <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP до 10 МБ</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <div className="text-xs text-text-muted mt-2">или вставьте URL:</div>
                    <input
                      type="url"
                      value={uploadedImage ? '' : bgPrompt}
                      onChange={(e) => { setBgPrompt(e.target.value); setUploadedImage(null); }}
                      placeholder="https://example.com/jacket.jpg"
                      className="w-full mt-1 px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">Новый фон</label>
                    <div className="flex flex-wrap gap-2">
                      {bgPresets.map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setSelectedBg(bg)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            selectedBg === bg
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-dark-600 text-text-muted border-border hover:text-white'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={bgPrompt}
                      onChange={(e) => setBgPrompt(e.target.value)}
                      placeholder="Или опишите свой фон..."
                      className="w-full mt-2 px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => runTool('bg-swapper')}
                    disabled={loading || !bgPrompt.trim()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                    {loading ? 'Замена фона...' : 'Заменить фон (2 кредитов)'}
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 mt-4 bg-red-500/10 text-red-400 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="mt-6">
                  <div className="bg-dark-600 rounded-xl p-3 inline-block">
                    <img src={result} alt="Результат" className="max-h-96 rounded-lg" />
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => downloadImage(result, `rustok-${activeTool}-${Date.now()}.jpg`)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/10 text-accent-green border border-accent-green/20 rounded-lg text-sm font-medium hover:bg-accent-green/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Скачать
                    </button>
                  </div>
                </div>
              )}

              {/* Batch results */}
              {batchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Результаты ({batchResults.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {batchResults.map((r: any, i: number) => (
                      <div key={i} className="bg-dark-600 rounded-xl p-2">
                        {r.processed ? (
                          <>
                            <img src={r.processed} alt={`Результат ${i + 1}`} className="w-full rounded-lg" />
                            <button
                              onClick={() => downloadImage(r.processed, `rustok-batch-${i + 1}.jpg`)}
                              className="mt-2 w-full text-center text-xs text-accent-green hover:text-accent-green/80 flex items-center justify-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Скачать
                            </button>
                          </>
                        ) : (
                          <div className="aspect-square flex items-center justify-center text-xs text-red-400">
                            {r.error || 'Ошибка'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
