import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { Sticker, StickerPack, StickerPackItem, UserStickerPack } from "@/types";
import toast from "react-hot-toast";

// Interface cho state và actions
interface StickerState {
  stickers: Sticker[];
  stickerPacks: StickerPack[];
  stickerPackItems: StickerPackItem[];
  userStickerPacks: UserStickerPack[];
  stickersPagination: { total: number; page: number; limit: number };
  stickerPacksPagination: { total: number; page: number; limit: number };
  userStickerPacksPagination: { total: number; page: number; limit: number };
  fetchStickers: (query?: {
    category?: string;
    is_premium?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchStickerPacks: (page?: number, limit?: number) => Promise<void>;
  fetchUserStickerPacks: (userId: string, page?: number, limit?: number) => Promise<void>;
  createSticker: (formData: FormData) => Promise<void>;
  updateSticker: (id: string, formData: FormData) => Promise<void>;
  deleteSticker: (id: string) => Promise<void>;
  createStickerPack: (data: {
    name: string;
    description: string;
    is_premium?: boolean;
    price?: number;
    stickerIds: string[];
  }) => Promise<void>;
  purchaseStickerPack: (userId: string, packId: string) => Promise<void>;
}

// Hàm hiển thị toast
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

// Tạo store với Zustand
export const useStickerStore = create<StickerState>((set) => ({
  stickers: [],
  stickerPacks: [],
  stickerPackItems: [],
  userStickerPacks: [],
  stickersPagination: { total: 0, page: 1, limit: 10 },
  stickerPacksPagination: { total: 0, page: 1, limit: 10 },
  userStickerPacksPagination: { total: 0, page: 1, limit: 10 },

  // Lấy danh sách stickers với phân trang
  fetchStickers: async (query = {}) => {
    try {
      const { category, is_premium, page = 1, limit = 10 } = query;
      const response = await axiosInstance.get("/users/stickers", {
        params: { category, is_premium, page, limit },
      });
      set({
        stickers: response.data.stickers, // Danh sách stickers từ backend
        stickersPagination: {
          total: response.data.total || 0,
          page: parseInt(response.data.page) || page,
          limit: parseInt(response.data.limit) || limit,
        },
      });
    } catch (error) {
      showErrorToast("Failed to fetch stickers");
      console.error(error);
    }
  },

  // Lấy danh sách sticker packs với phân trang
  fetchStickerPacks: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get("/users/sticker-packs", {
        params: { page, limit },
      });
      set({
        stickerPacks: response.data.stickerPacks, // Danh sách sticker packs từ backend
        stickerPacksPagination: {
          total: response.data.total || 0,
          page: parseInt(response.data.page) || page,
          limit: parseInt(response.data.limit) || limit,
        },
      });
    } catch (error) {
      showErrorToast("Failed to fetch sticker packs");
      console.error(error);
    }
  },

  // Lấy danh sách sticker packs của user với phân trang
  fetchUserStickerPacks: async (userId: string, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/users/user/${userId}/sticker-packs`, {
        params: { page, limit },
      });
      set({
        userStickerPacks: response.data.userStickerPacks, // Dữ liệu từ userStickerPacks
        userStickerPacksPagination: {
          total: response.data.pagination.total || 0,
          page: response.data.pagination.page || page,
          limit: response.data.pagination.limit || limit,
        },
      });
    } catch (error) {
      showErrorToast("Failed to fetch user's sticker packs");
      console.error(error);
    }
  },

  createSticker: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post("/users/stickers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        stickers: [response.data.sticker, ...state.stickers], // Thêm vào đầu danh sách
        stickersPagination: {
          ...state.stickersPagination,
          total: state.stickersPagination.total + 1,
        },
      }));
      showSuccessToast("Sticker created successfully");
    } catch (error) {
      showErrorToast("Failed to create sticker");
      console.error(error);
    }
  },

  // Cập nhật sticker
  updateSticker: async (id: string, formData: FormData) => {
    try {
      const response = await axiosInstance.put(`/users/stickers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        stickers: state.stickers.map((sticker) =>
          sticker._id === id ? response.data.sticker : sticker
        ),
      }));
      showSuccessToast("Sticker updated successfully");
    } catch (error) {
      showErrorToast("Failed to update sticker");
      console.error(error);
    }
  },

  // Xóa sticker
  deleteSticker: async (id: string) => {
    try {
      await axiosInstance.delete(`/users/stickers/${id}`);
      set((state) => ({
        stickers: state.stickers.filter((sticker) => sticker._id !== id),
        stickersPagination: {
          ...state.stickersPagination,
          total: state.stickersPagination.total - 1,
        },
      }));
      showSuccessToast("Sticker deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete sticker");
      console.error(error);
    }
  },

  // Tạo sticker pack mới
  createStickerPack: async (data: {
    name: string;
    description: string;
    is_premium?: boolean;
    price?: number;
    stickerIds: string[];
  }) => {
    try {
      const response = await axiosInstance.post("/users/sticker-packs", data);
      set((state) => ({
        stickerPacks: [response.data.stickerPack, ...state.stickerPacks], // Thêm vào đầu danh sách
        stickerPacksPagination: {
          ...state.stickerPacksPagination,
          total: state.stickerPacksPagination.total + 1,
        },
      }));
      showSuccessToast("Sticker pack created successfully");
    } catch (error) {
      showErrorToast("Failed to create sticker pack");
      console.error(error);
    }
  },

  // Mua sticker pack
  purchaseStickerPack: async (userId: string, packId: string) => {
    try {
      const response = await axiosInstance.post("/users/sticker-packs/purchase", {
        userId,
        packId,
      });
      set((state) => ({
        userStickerPacks: [response.data.purchase, ...state.userStickerPacks], // Thêm vào đầu danh sách
        userStickerPacksPagination: {
          ...state.userStickerPacksPagination,
          total: state.userStickerPacksPagination.total + 1,
        },
        stickerPacks: state.stickerPacks.map((pack) =>
          pack._id === packId ? { ...pack, isOwned: true } : pack
        ),
      }));
      showSuccessToast("Sticker pack purchased successfully");
    } catch (error) {
      showErrorToast("Failed to purchase sticker pack");
      console.error(error);
    }
  },
}));