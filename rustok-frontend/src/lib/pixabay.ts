const PROXY_URL = '/api/pixabay';

export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user: string;
  userImageURL: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export async function searchPixabay(
  query: string,
  page = 1,
  perPage = 20,
  category = '',
): Promise<PixabayResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (query) params.set('q', query);
  if (category) params.set('category', category);

  const res = await fetch(`${PROXY_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Ошибка поиска: ${res.status}`);
  return res.json();
}

export async function getPixabayPopular(page = 1, perPage = 20): Promise<PixabayResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    order: 'popular',
  });

  const res = await fetch(`${PROXY_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
  return res.json();
}

export function pixabayToStock(img: PixabayImage) {
  return {
    id: String(img.id),
    title: img.tags.split(', ').slice(0, 3).join(', '),
    description: img.tags,
    url: img.largeImageURL,
    thumbnail: img.webformatURL,
    preview: img.previewURL,
    width: img.imageWidth,
    height: img.imageHeight,
    author: img.user,
    downloads: img.downloads,
    likes: img.likes,
    comments: img.comments,
    views: img.views,
    tags: img.tags.split(', '),
    credits: 3,
    type: img.type,
    pageURL: img.pageURL,
  };
}
