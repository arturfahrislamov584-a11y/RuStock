import { create } from 'zustand';
import type { User, GenerationResult, DownloadHistory } from '../types';
import {
  apiLogin, apiRegister, apiGetMe, apiLogout,
  apiUpdateProfile, apiChangePassword,
  apiGetCredits, apiUseCredits, apiAddCredits,
  apiGetFavorites, apiToggleFavorite,
  apiGetDownloads, apiAddDownload,
  apiGetGenerations, apiAddGeneration,
} from '../lib/apiClient';

interface FavoriteItem {
  id: string;
  userId: string;
  imageId: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  credits: number;
  generatedContent: GenerationResult[];
  downloadHistory: DownloadHistory[];
  favorites: string[];
  favoriteIds: string[];
  searchQuery: string;
  loading: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, inn?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  useCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  addGeneratedContent: (item: GenerationResult) => Promise<void>;
  addToDownloadHistory: (item: DownloadHistory) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  updateProfile: (data: { name?: string; email?: string; inn?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  credits: 0,
  generatedContent: [],
  downloadHistory: [],
  favorites: [],
  favoriteIds: [],
  searchQuery: '',
  loading: true,

  init: async () => {
    try {
      const token = localStorage.getItem('rustok_token');
      if (!token) { set({ loading: false }); return; }

      const user = await apiGetMe();
      const [creditsData, favs, downloads, gens] = await Promise.all([
        apiGetCredits(),
        apiGetFavorites(),
        apiGetDownloads(),
        apiGetGenerations(),
      ]);

      set({
        user,
        isAuthenticated: true,
        credits: creditsData.credits,
        favoriteIds: favs.map((f: FavoriteItem) => f.imageId),
        downloadHistory: downloads,
        generatedContent: gens,
        loading: false,
      });
    } catch {
      localStorage.removeItem('rustok_token');
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      set({ user: data.user, isAuthenticated: true, credits: data.user.credits });

      const [favs, downloads, gens] = await Promise.all([
        apiGetFavorites(),
        apiGetDownloads(),
        apiGetGenerations(),
      ]);
      set({
        favoriteIds: favs.map((f: FavoriteItem) => f.imageId),
        downloadHistory: downloads,
        generatedContent: gens,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  register: async (name, email, password, inn) => {
    try {
      const data = await apiRegister(name, email, password, inn);
      set({ user: data.user, isAuthenticated: true, credits: data.user.credits });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  logout: () => {
    apiLogout();
    set({
      user: null,
      isAuthenticated: false,
      credits: 0,
      generatedContent: [],
      downloadHistory: [],
      favorites: [],
      favoriteIds: [],
    });
  },

  useCredits: async (amount) => {
    try {
      const data = await apiUseCredits(amount);
      set({ credits: data.credits });
      return true;
    } catch {
      return false;
    }
  },

  addCredits: async (amount) => {
    try {
      const data = await apiAddCredits(amount);
      set({ credits: data.credits });
    } catch {}
  },

  addGeneratedContent: async (item) => {
    try {
      const data = await apiAddGeneration(item.prompt, item.model, item.url, item.credits);
      set((s) => ({
        generatedContent: [item, ...s.generatedContent],
        credits: data.credits,
      }));
    } catch {}
  },

  addToDownloadHistory: async (item) => {
    try {
      const data = await apiAddDownload(item.content.id, item.content.title, item.content.thumbnail, item.credits);
      set((s) => ({
        downloadHistory: [item, ...s.downloadHistory],
        credits: data.credits,
      }));
    } catch {}
  },

  toggleFavorite: async (id) => {
    const { favoriteIds } = get();
    const wasFav = favoriteIds.includes(id);

    set({
      favoriteIds: wasFav
        ? favoriteIds.filter((f) => f !== id)
        : [...favoriteIds, id],
    });

    try {
      await apiToggleFavorite(id);
    } catch {
      set({
        favoriteIds: wasFav
          ? [...favoriteIds, id]
          : favoriteIds.filter((f) => f !== id),
      });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  updateProfile: async (data) => {
    try {
      const updated = await apiUpdateProfile(data);
      set({ user: updated });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  changePassword: async (oldPass, newPass) => {
    try {
      await apiChangePassword(oldPass, newPass);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
}));
