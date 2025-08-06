import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import {
  User,
} from "@/types";
import toast from "react-hot-toast";

interface FriendStore {
  friends: User[];
  pendingRequests: {
    _id: string;
    user_id1: User;
    user_id2: User;
    status: string;
  }[];
  isLoading: boolean;
  error: string | null;

  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  sendFriendRequest: (friendClerkId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  declineFriendRequest: (friendshipId: string) => Promise<void>;
}

const showSuccessToast = (message: string) =>
  toast.success(message, {
    style: {
      borderRadius: "8px",
      background: "#1f2937",
      color: "#22c55e",
      padding: "12px 16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    iconTheme: { primary: "#22c55e", secondary: "#1f2937" },
  });

const showErrorToast = (message: string) =>
  toast.error(message, {
    style: {
      borderRadius: "8px",
      background: "#1f2937",
      color: "#ef4444",
      padding: "12px 16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    iconTheme: { primary: "#ef4444", secondary: "#1f2937" },
  });

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users/friends");
      set({ friends: response.data, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch friends";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users/pending-requests");
      set({ pendingRequests: response.data, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch pending requests";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (friendClerkId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/users/friend-request", {
        friendClerkId,
      });
      set({ error: null });
      showSuccessToast("Friend request sent successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send friend request";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptFriendRequest: async (friendshipId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/users/friend-request/${friendshipId}/accept`
      );
      await Promise.all([get().fetchFriends(), get().fetchPendingRequests()]);
      set({ error: null });
      showSuccessToast("Friend request accepted");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to accept friend request";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  declineFriendRequest: async (friendshipId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/users/friend-request/${friendshipId}`);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (r) => r._id !== friendshipId
        ),
      }));
      showSuccessToast("Friend request declined successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to decline friend request";
      set({
        error:
          error.response?.data?.message || "Failed to decline friend request",
      });
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));
