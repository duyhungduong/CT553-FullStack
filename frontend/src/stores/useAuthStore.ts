import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;
	userId: string;

	checkAdminStatus: () => Promise<void>;
	reset: () => void;
	setUserId: (userId: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isLoading: false,
	error: null,
	userId: "",

	setUserId: (userId: string) => {
		set({ userId })
	},

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false, error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isLoading: false, error: null });
	},
}));