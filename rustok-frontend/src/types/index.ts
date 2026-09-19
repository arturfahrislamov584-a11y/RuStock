export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'author' | 'admin';
  credits: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: string;
  inn?: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: ContentCategory;
  type: 'photo' | 'video' | 'vector' | 'template';
  url: string;
  thumbnail: string;
  author: User;
  downloads: number;
  likes: number;
  credits: number;
  resolution?: string;
  format?: string;
  fileSize?: string;
  duration?: string;
  createdAt: string;
}

export type ContentCategory =
  | 'business'
  | 'technology'
  | 'nature'
  | 'people'
  | 'food'
  | 'travel'
  | 'fashion'
  | 'architecture'
  | 'abstract'
  | 'backgrounds'
  | 'templates'
  | 'mockups';

export interface GenerationRequest {
  prompt: string;
  model: string;
  type: 'photo' | 'video';
  style?: string;
  resolution?: string;
  count: number;
}

export interface GenerationResult {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  credits: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export interface DownloadHistory {
  id: string;
  content: Content;
  downloadedAt: string;
  credits: number;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  metadata?: Partial<Content>;
}
