import { Song } from '@/types';
import { create } from 'zustand';
import { axiosInstance } from "@/lib/axios";

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: {
    songs: Song[];
    artists: any[];
    albums: any[];
  };
  setSearchResults: (results: { songs: Song[]; artists: any[]; albums: any[] }) => void;
  recommendations: {
    [userId: string]: {
      itemBased: Song[];
      userBased: Song[];
      knowledgeBased: Song[];
      utilityBased: Song[];
      demographicBased: Song[];
      contentBased: Song[];
      collaborativeUser: Song[];
      hybrid: Song[];
      matrixFactorization: Song[];
    };
  }; // Lưu recommendations theo userId cho tất cả phương pháp
  setRecommendations: (
    userId: string,
    results: {
      itemBased: Song[];
      userBased: Song[];
      knowledgeBased: Song[];
      utilityBased: Song[];
      demographicBased: Song[];
      contentBased: Song[];
      collaborativeUser: Song[];
      hybrid: Song[];
      matrixFactorization: Song[];
    }
  ) => void;
  fetchRecommendations: (userId: string, queryParams?: { [key: string]: string }) => Promise<void>;
  isLoadingRecommendations: boolean;
  setIsLoadingRecommendations: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: { songs: [], artists: [], albums: [] },
  setSearchResults: (results) => set({ searchResults: results }),
  recommendations: {}, // Object lưu trữ recommendations theo userId
  setRecommendations: (userId, results) =>
    set((state) => ({
      recommendations: {
        ...state.recommendations,
        [userId]: results,
      },
    })),
  isLoadingRecommendations: false,
  setIsLoadingRecommendations: (loading) => set({ isLoadingRecommendations: loading }),
  fetchRecommendations: async (userId, queryParams = {}) => {
    const state = get();
    if (state.isLoadingRecommendations || (state.recommendations[userId] && !queryParams)) return; // Kiểm tra loading hoặc đã có dữ liệu (trừ khi có query mới)

    set({ isLoadingRecommendations: true });
    try {
      const [
        itemResponse,
        userResponse,
        knowledgeResponse,
        utilityResponse,
        demographicResponse,
        contentResponse,
        collabUserResponse,
        hybridResponse,
        matrixResponse,
      ] = await Promise.all([
        axiosInstance.get(`/recommendations/item-based/${userId}`),
        axiosInstance.get(`/recommendations/user-based/${userId}`),
        axiosInstance.get(`/recommendations/knowledge-based/${userId}`, { params: queryParams }),
        axiosInstance.get(`/recommendations/utility-based/${userId}`, { params: queryParams }),
        axiosInstance.get(`/recommendations/demographic-based/${userId}`),
        axiosInstance.get(`/recommendations/content-based/${userId}`),
        axiosInstance.get(`/recommendations/collaborative-user/${userId}`),
        axiosInstance.get(`/recommendations/hybrid/${userId}`),
        axiosInstance.get(`/recommendations/matrix-factorization/${userId}`),
      ]);

      set({
        recommendations: {
          ...state.recommendations,
          [userId]: {
            itemBased: itemResponse.data.songs || [],
            userBased: userResponse.data.songs || [],
            knowledgeBased: knowledgeResponse.data.songs || [],
            utilityBased: utilityResponse.data.songs || [],
            demographicBased: demographicResponse.data.songs || [],
            contentBased: contentResponse.data.songs || [],
            collaborativeUser: collabUserResponse.data.songs || [],
            hybrid: hybridResponse.data.songs || [],
            matrixFactorization: matrixResponse.data.songs || [],
          },
        },
      });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      set((state) => ({
        recommendations: {
          ...state.recommendations,
          [userId]: {
            itemBased: [],
            userBased: [],
            knowledgeBased: [],
            utilityBased: [],
            demographicBased: [],
            contentBased: [],
            collaborativeUser: [],
            hybrid: [],
            matrixFactorization: [],
          },
        },
      }));
    } finally {
      set({ isLoadingRecommendations: false });
    }
  },
}));