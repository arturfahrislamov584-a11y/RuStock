const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('rustok_token');
}

function setToken(token: string) {
  localStorage.setItem('rustok_token', token);
}

function clearToken() {
  localStorage.removeItem('rustok_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

// ─── Auth ────────────────────────────────────────────

export async function apiRegister(name: string, email: string, password: string, inn?: string) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, inn }),
  });
  setToken(data.token);
  return data;
}

export async function apiLogin(email: string, password: string) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiGetMe() {
  return request('/auth/me');
}

export function apiLogout() {
  clearToken();
}

// ─── Profile ─────────────────────────────────────────

export async function apiUpdateProfile(data: { name?: string; email?: string; inn?: string }) {
  return request('/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiChangePassword(oldPassword: string, newPassword: string) {
  return request('/profile/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// ─── Credits ─────────────────────────────────────────

export async function apiGetCredits() {
  return request('/credits');
}

export async function apiUseCredits(amount: number) {
  return request('/credits/use', { method: 'POST', body: JSON.stringify({ amount }) });
}

export async function apiAddCredits(amount: number) {
  return request('/credits/add', { method: 'POST', body: JSON.stringify({ amount }) });
}

// ─── Favorites ───────────────────────────────────────

export async function apiGetFavorites() {
  return request('/favorites');
}

export async function apiToggleFavorite(imageId: string) {
  return request('/favorites', { method: 'POST', body: JSON.stringify({ imageId }) });
}

// ─── Downloads ───────────────────────────────────────

export async function apiGetDownloads() {
  return request('/downloads');
}

export async function apiAddDownload(imageId: string, title: string, thumbnail: string, credits: number) {
  return request('/downloads', {
    method: 'POST',
    body: JSON.stringify({ imageId, title, thumbnail, credits }),
  });
}

// ─── Generations ─────────────────────────────────────

export async function apiGetGenerations() {
  return request('/generations');
}

export async function apiAddGeneration(prompt: string, model: string, url: string, credits: number) {
  return request('/generations', {
    method: 'POST',
    body: JSON.stringify({ prompt, model, url, credits }),
  });
}

// ─── Stats ───────────────────────────────────────────

export async function apiGetStats() {
  return request('/stats');
}

// ─── Author ──────────────────────────────────────────

export async function apiUpgradeToAuthor(data: { bio?: string; portfolio?: string; specializations?: string[] }) {
  return request('/author/upgrade', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUploadContent(data: {
  title: string; description?: string; tags?: string[];
  category?: string; imageUrl: string; thumbnailUrl?: string;
  width?: number; height?: number; format?: string;
}) {
  return request('/author/upload', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiGetAuthorContent() {
  return request('/author/content');
}

export async function apiDeleteAuthorContent(id: string) {
  return request(`/author/content/${id}`, { method: 'DELETE' });
}

export async function apiGetAuthorStats() {
  return request('/author/stats');
}

export async function apiGetAllAuthorContent() {
  return request('/author/all-content');
}
