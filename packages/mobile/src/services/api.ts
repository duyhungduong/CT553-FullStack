import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Update this to match your backend
const BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  fileUrl: string;
  artwork?: string;
  genre?: string;
  uploadedBy: string;
  plays: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  songs: Song[];
  artwork?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  // Login user
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await AsyncStorage.multiRemove(['authToken', 'userData']);
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  // Update profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data.data;
  },
};

// Songs API
export const songsAPI = {
  // Get all songs
  getAllSongs: async (): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>('/songs');
    return response.data.data;
  },

  // Get song by ID
  getSongById: async (id: string): Promise<Song> => {
    const response = await api.get<ApiResponse<Song>>(`/songs/${id}`);
    return response.data.data;
  },

  // Search songs
  searchSongs: async (query: string): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>(`/songs/search?q=${query}`);
    return response.data.data;
  },

  // Get trending songs
  getTrendingSongs: async (): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>('/songs/trending');
    return response.data.data;
  },

  // Get songs by genre
  getSongsByGenre: async (genre: string): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>(`/songs/genre/${genre}`);
    return response.data.data;
  },

  // Upload song
  uploadSong: async (formData: FormData): Promise<Song> => {
    const response = await api.post<ApiResponse<Song>>('/songs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Like/Unlike song
  toggleLikeSong: async (songId: string): Promise<{ isLiked: boolean }> => {
    const response = await api.post<ApiResponse<{ isLiked: boolean }>>(`/songs/${songId}/like`);
    return response.data.data;
  },

  // Increment play count
  incrementPlayCount: async (songId: string): Promise<void> => {
    await api.post(`/songs/${songId}/play`);
  },

  // Get user's liked songs
  getLikedSongs: async (): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>('/songs/liked');
    return response.data.data;
  },
};

// Playlists API
export const playlistsAPI = {
  // Get all playlists
  getAllPlaylists: async (): Promise<Playlist[]> => {
    const response = await api.get<ApiResponse<Playlist[]>>('/playlists');
    return response.data.data;
  },

  // Get user's playlists
  getUserPlaylists: async (): Promise<Playlist[]> => {
    const response = await api.get<ApiResponse<Playlist[]>>('/playlists/user');
    return response.data.data;
  },

  // Get playlist by ID
  getPlaylistById: async (id: string): Promise<Playlist> => {
    const response = await api.get<ApiResponse<Playlist>>(`/playlists/${id}`);
    return response.data.data;
  },

  // Create playlist
  createPlaylist: async (playlistData: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>('/playlists', playlistData);
    return response.data.data;
  },

  // Update playlist
  updatePlaylist: async (id: string, updates: Partial<Playlist>): Promise<Playlist> => {
    const response = await api.put<ApiResponse<Playlist>>(`/playlists/${id}`, updates);
    return response.data.data;
  },

  // Delete playlist
  deletePlaylist: async (id: string): Promise<void> => {
    await api.delete(`/playlists/${id}`);
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>(`/playlists/${playlistId}/songs`, {
      songId,
    });
    return response.data.data;
  },

  // Remove song from playlist
  removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.delete<ApiResponse<Playlist>>(`/playlists/${playlistId}/songs/${songId}`);
    return response.data.data;
  },
};

// Storage utilities
export const storage = {
  // Save auth token
  saveAuthToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem('authToken', token);
  },

  // Get auth token
  getAuthToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  },

  // Save user data
  saveUserData: async (user: User): Promise<void> => {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  },

  // Get user data
  getUserData: async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear all storage
  clearStorage: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
  },
};

export default api;
