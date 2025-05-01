import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

import "../App.css";

const setupAxiosInterceptors = (getToken: () => Promise<string | null>) => {
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const { initSocket, disconnectSocket, fetchInfo } = useChatStore();
  const { checkAdminStatus } = useAuthStore();
  

  useEffect(() => {
    const initAuth = async () => {
      try {
        setupAxiosInterceptors(getToken); // Cấu hình Axios interceptor
        const token = await getToken();
        if (token) {
          await checkAdminStatus();
          if (userId){
            initSocket(userId);
            await fetchInfo();
          } 
        }
      } catch (error: any) {
        console.log("Error in auth provider", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    fetchInfo();

    return () => disconnectSocket();
  }, [
    getToken,
    userId,
    checkAdminStatus,
    initSocket,
    disconnectSocket,
    fetchInfo,
  ]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0b2e] via-[#2e1a47] to-[#0f172a] overflow-hidden">
        {/* Particle background */}
        <div
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_3s_ease-in-out_infinite]"
          style={{ top: "10%", left: "20%" }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_3s_ease-in-out_infinite_1s]"
          style={{ top: "30%", left: "70%" }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_3s_ease-in-out_infinite_1s]"
          style={{ top: "60%", left: "40%", animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_3s_ease-in-out_infinite_1s]"
          style={{ top: "80%", left: "90%", animationDelay: "1.5s" }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-[float_3s_ease-in-out_infinite_1s]"
          style={{ top: "20%", left: "50%", animationDelay: "2s" }}
        />

        {/* Container chính */}
        <div className="relative flex flex-col items-center gap-6 backdrop-blur-lg bg-black/40 p-8 rounded-3xl shadow-2xl border border-white/10">
          {/* Logo với music notes */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Melodia"
              className="w-full h-full rounded-full object-cover border-2 border-purple-500/40 shadow-xl transition-transform hover:scale-110"
            />
          </div>
          <h1 className="text-4xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-transparent bg-clip-text animate-[gradient_4s_ease_infinite] bg-[length:200%_200%]">
            Melodia
          </h1>

          {/* Loading text */}
          <div className="flex items-center gap-5 animate-[fade-in_1s_ease-out_0.2s_forwards]">
            <svg
              className="w-6 h-6 text-teal-400 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <span className="text-gray-300 text-lg font-light tracking-wide">
              Loading...
            </span>
          </div>

          {/* Music bars */}
          <div className="flex gap-1 max-w-xl animate-[fade-in_1s_ease-out_0.4s_forwards]">
            {Array.from({ length: 40 }).map((_, index) => (
              <div
                key={index}
                className="w-1 h-12 rounded-full animate-[music-bar_1s_ease-in-out_infinite]"
                style={{
                  // animationDelay: "0s",
                  // animationDuration: "1s",
                  background:
                    index % 7 === 0
                      ? "linear-gradient(to bottom, #9333ea, transparent)"
                      : index % 7 === 1
                      ? "linear-gradient(to bottom, #06b6d4, transparent)"
                      : index % 7 === 2
                      ? "linear-gradient(to bottom, #f472b6, transparent)"
                      : index % 7 === 3
                      ? "linear-gradient(to bottom, #4ade80, transparent)"
                      : index % 7 === 4
                      ? "linear-gradient(to bottom, #fb923c, transparent)"
                      : index % 7 === 5
                      ? "linear-gradient(to bottom, #c084fc, transparent)"
                      : index % 7 === 6
                      ? "linear-gradient(to bottom, #2dd4bf, transparent)"
                      : "linear-gradient(to bottom, #2dd4bf, transparent)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
