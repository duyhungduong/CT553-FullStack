import { create } from "zustand";

export const useThemeStore = create(() => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
//   setTheme: (theme) => {
//     localStorage.setItem("chat-theme", theme);
//     set({ theme });
//   },
}));