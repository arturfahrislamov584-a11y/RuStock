export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
  enhance?: boolean;
}

export function buildGenerateURL(params: GenerateImageParams): string {
  const { prompt, width = 1024, height = 1024, model = 'flux', seed, enhance = true } = params;
  const s = seed || Math.floor(Math.random() * 999999);
  return `/api/generate/image?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&model=${model}&seed=${s}&enhance=${enhance}`;
}

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const url = buildGenerateURL(params);
  const token = localStorage.getItem('rustok_token');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ошибка генерации' }));
    throw new Error(err.error || 'Ошибка генерации');
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export const pollinationsModels = [
  { id: 'flux', name: 'Flux Pro', type: 'photo' as const, credits: 3, description: 'Высокое качество, детализация' },
  { id: 'flux-realism', name: 'Flux Realism', type: 'photo' as const, credits: 3, description: 'Фотореалистичные изображения' },
  { id: 'flux-anime', name: 'Flux Anime', type: 'photo' as const, credits: 3, description: 'Аниме и манга стиль' },
  { id: 'flux-3d', name: 'Flux 3D', type: 'photo' as const, credits: 3, description: '3D рендеринг' },
  { id: 'turbo', name: 'Turbo', type: 'photo' as const, credits: 2, description: 'Быстрая генерация' },
];
