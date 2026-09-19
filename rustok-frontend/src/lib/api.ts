const UNSPLASH_ACCESS_KEY = 'gT68s8FjCwzTUe24YRwC5mXvOy_JaQx-9f8m5K2cD3s';

export interface UnsplashImage {
  id: string;
  description: string;
  alt_description: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
  user: {
    name: string;
    username: string;
  };
  created_at: string;
  tags?: Array<{ type: string; title: string }>;
}

export interface SearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export async function searchPhotos(
  query: string,
  page = 1,
  perPage = 20,
  orderBy: 'relevant' | 'latest' = 'relevant'
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    order_by: orderBy,
    client_id: UNSPLASH_ACCESS_KEY,
  });

  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`);
  if (!res.ok) throw new Error('Ошибка поиска');
  return res.json();
}

export async function getRandomPhotos(
  count = 20,
  query?: string
): Promise<UnsplashImage[]> {
  const params = new URLSearchParams({
    count: String(count),
    client_id: UNSPLASH_ACCESS_KEY,
  });
  if (query) params.set('query', query);

  const res = await fetch(`https://api.unsplash.com/photos/random?${params}`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export function convertUnsplashToContent(img: UnsplashImage) {
  return {
    id: img.id,
    title: img.alt_description || img.description || 'Без названия',
    description: img.description || img.alt_description || '',
    thumbnail: img.urls.small,
    url: img.urls.regular,
    author: img.user.name,
    downloads: img.likes,
    resolution: `${img.width}x${img.height}`,
    createdAt: img.created_at,
    color: img.color,
    tags: img.tags?.map((t) => t.title) || [],
  };
}
