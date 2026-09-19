import { useState } from 'react';
import {
  Zap, Sparkles, Wand2, Loader2, Download,
  RefreshCw, Copy, AlertCircle, Check
} from 'lucide-react';
import { generateImage, pollinationsModels } from '../lib/pollinations';
import { useStore } from '../store/useStore';

const styles = [
  'Реалистичный', 'Художественный', 'Минимализм', 'Корпоративный',
  'Яркий', 'Пастельный', 'Контрастный', 'Тёмный', 'Космический', 'Ретро',
];

const resolutions: Record<string, { w: number; h: number }> = {
  '1024x1024': { w: 1024, h: 1024 },
  '1280x720': { w: 1280, h: 720 },
  '1920x1080': { w: 1920, h: 1080 },
  '720x1280': { w: 720, h: 1280 },
  '1080x1920': { w: 1080, h: 1920 },
};

interface GeneratedImage {
  id: string;
  blobUrl: string | null;
  prompt: string;
  model: string;
  style: string;
  resolution: string;
  createdAt: string;
  credits: number;
  loading: boolean;
  error: boolean;
}

export default function Generate() {
  const { credits, useCredits, addGeneratedContent } = useStore();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('1024x1024');
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const currentModel = pollinationsModels.find((m) => m.id === selectedModel);
  const totalCredits = (currentModel?.credits || 3) * count;

  const buildFullPrompt = (basePrompt: string) => {
    let full = basePrompt;
    if (selectedStyle) full = `${selectedStyle} style, ${full}`;
    full += ', high quality, detailed, professional, 4k';
    return full;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Введите описание для генерации');
      return;
    }
    if (credits < totalCredits) {
      setError(`Недостаточно кредитов. Нужно ${totalCredits}, доступно ${credits}`);
      return;
    }

    setError('');
    setIsGenerating(true);

    const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      blobUrl: null,
      prompt: prompt,
      model: selectedModel,
      style: selectedStyle,
      resolution: selectedResolution,
      createdAt: new Date().toISOString(),
      credits: currentModel?.credits || 3,
      loading: true,
      error: false,
    }));

    setGeneratedImages((prev) => [...newImages, ...prev]);

    const success = await useCredits(totalCredits);
    if (!success) {
      setError('Не удалось списать кредиты');
      setIsGenerating(false);
      return;
    }

    const res = resolutions[selectedResolution];

    for (let i = 0; i < count; i++) {
      const fullPrompt = buildFullPrompt(prompt);

      try {
        const blobUrl = await generateImage({
          prompt: fullPrompt,
          width: res.w,
          height: res.h,
          model: selectedModel,
          seed: Math.floor(Math.random() * 999999),
        });

        setGeneratedImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, blobUrl, loading: false } : img
          )
        );

        addGeneratedContent({
          id: `gen-${Date.now()}-${i}`,
          url: blobUrl,
          prompt: fullPrompt,
          model: selectedModel,
          createdAt: new Date().toISOString(),
          credits: currentModel?.credits || 3,
        });
      } catch (err: any) {
        console.error('Generation error:', err);
        setGeneratedImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, loading: false, error: true } : img
          )
        );
      }
    }

    setIsGenerating(false);
  };

  const downloadImage = (img: GeneratedImage) => {
    const url = img.blobUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `rustok-${img.model}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const regenerate = async (index: number) => {
    const img = generatedImages[index];
    if (!img) return;

    const res = resolutions[img.resolution];
    const fullPrompt = buildFullPrompt(img.prompt);

    setGeneratedImages((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, blobUrl: null, loading: true, error: false } : item
      )
    );

    try {
      const blobUrl = await generateImage({
        prompt: fullPrompt,
        width: res.w,
        height: res.h,
        model: img.model,
      });
      setGeneratedImages((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, blobUrl, loading: false } : item
        )
      );
    } catch {
      setGeneratedImages((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, loading: false, error: true } : item
        )
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-5">
          <div>
            <h1 className="text-2xl font-bold mb-1">ИИ-генерация</h1>
            <p className="text-sm text-text-muted">Создавайте фото через Pollinations.ai</p>
          </div>

          {/* Credits */}
          <div className="p-4 bg-dark-700 border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Ваши кредиты</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent-yellow" />
                <span className="text-lg font-bold">{credits}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-accent-yellow rounded-full transition-all" style={{ width: `${Math.min((credits / 500) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-medium mb-2 block">Модель ИИ</label>
            <div className="space-y-2">
              {pollinationsModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedModel === model.id
                      ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20'
                      : 'bg-dark-700 border border-border hover:border-border-light'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-text-muted">{model.description}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-accent-yellow">
                      <Zap className="w-3 h-3" />{model.credits}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-sm font-medium mb-2 block">Стиль</label>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStyle === style
                      ? 'bg-primary text-white'
                      : 'bg-dark-700 text-text-secondary border border-border hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label className="text-sm font-medium mb-2 block">Разрешение</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(resolutions).map((res) => (
                <button
                  key={res}
                  onClick={() => setSelectedResolution(res)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedResolution === res
                      ? 'bg-primary text-white'
                      : 'bg-dark-700 text-text-secondary border border-border hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-sm font-medium mb-2 block">Количество: {count}</label>
            <input type="range" min={1} max={4} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-text-muted mt-1"><span>1</span><span>2</span><span>3</span><span>4</span></div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || credits < totalCredits}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Генерация...</>
            ) : (
              <><Wand2 className="w-4 h-4" />Генерировать ({totalCredits} кредитов)</>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-dark-700 border border-border rounded-xl p-5">
            <label className="text-sm font-medium mb-2 block">Описание (промпт)</label>
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setError(''); }}
              placeholder="Опишите что хотите создать... Например: Современный офис с панорамными окнами и видом на город"
              className="w-full h-32 bg-dark-600 border border-border rounded-xl p-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-muted">{prompt.length} символов</span>
              {selectedStyle && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg">Стиль: {selectedStyle}</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Результаты</h2>
              <span className="text-xs text-text-muted">{generatedImages.length} изображений</span>
            </div>

            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((item) => (
                  <div key={item.id} className="bento-item group">
                    <div className="aspect-square bg-dark-600 overflow-hidden rounded-t-2xl relative">
                      {item.loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                          <span className="text-xs text-text-muted">Генерация (~15 сек)...</span>
                        </div>
                      ) : item.error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                          <span className="text-xs text-red-400">Ошибка</span>
                          <button onClick={() => regenerate(generatedImages.indexOf(item))} className="mt-2 text-xs text-primary hover:text-primary-light">
                            Попробовать снова
                          </button>
                        </div>
                      ) : (
                        <img src={item.blobUrl || ''} alt={item.prompt} className="w-full h-full object-cover" />
                      )}
                      {!item.loading && !item.error && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1 px-2 py-1 bg-accent-green/90 text-white text-xs rounded-lg">
                            <Check className="w-3 h-3" /> Готово
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-text-muted truncate mb-1">{item.prompt}</p>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                        <span className="bg-dark-600 px-1.5 py-0.5 rounded">{item.model}</span>
                        {item.style && <span className="bg-dark-600 px-1.5 py-0.5 rounded">{item.style}</span>}
                      </div>
                      {!item.loading && !item.error && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => downloadImage(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors">
                            <Download className="w-3.5 h-3.5" /> Скачать
                          </button>
                          <button onClick={() => regenerate(generatedImages.indexOf(item))} className="p-2 bg-dark-600 hover:bg-dark-500 text-text-muted hover:text-white rounded-lg transition-colors" title="Перегенерировать">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => navigator.clipboard.writeText(item.prompt)} className="p-2 bg-dark-600 hover:bg-dark-500 text-text-muted hover:text-white rounded-lg transition-colors" title="Копировать промпт">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-dark-700 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center">
                <Wand2 className="w-12 h-12 text-dark-500 mb-3" />
                <p className="text-sm text-text-muted">Введите промпт и нажмите «Генерировать»</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Powered by Pollinations.ai
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
