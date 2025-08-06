import { create } from 'zustand';
import { authAPI, storage, User, AuthCredentials, RegisterData } from '../services/api';

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Actions
  login: async (credentials: AuthCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authAPI.login(credentials);
      
      // Save to storage
      await storage.saveAuthToken(response.token);
      await storage.saveUserData(response.user);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw new Error(errorMessage);
    }
  },
  
  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authAPI.register(userData);
      
      // Save to storage
      await storage.saveAuthToken(response.token);
      await storage.saveUserData(response.user);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Call API logout
      await authAPI.logout();
      
      // Clear storage
      await storage.clearStorage();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await storage.clearStorage();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      
      const [token, userData] = await Promise.all([
        storage.getAuthToken(),
        storage.getUserData(),
      ]);
      
      if (token && userData) {
        // Verify token is still valid by getting current user
        try {
          const currentUser = await authAPI.getCurrentUser();
          
          set({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid, clear storage
          await storage.clearStorage();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to load stored authentication',
      });
    }
  },
  
  updateProfile: async (userData: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedUser = await authAPI.updateProfile(userData);
      
      // Update storage
      await storage.saveUserData(updatedUser);
      
      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },
  
  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
