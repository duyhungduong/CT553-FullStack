import { create } from "zustand";
import { Song, TrackArtist } from "@/types";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { useAuth } from "@clerk/clerk-react";
// import { useAuth } from "@clerk/clerk-react";

interface PlayerStore {
  audio: HTMLAudioElement;
  volume: number;
  setVolume: (volume: number) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  isShuffle: boolean;
  currentIndex: number;
  trackartist: TrackArtist[];
  playbackPosition: number;
  repeatMode: "off" | "song" | "queue";

  // Existing methods
  saveQueue: (
    userId: string,
    name: string,
    description?: string
  ) => Promise<void>;
  setShuffle: (isShuffle: boolean) => void;
  setRepeatMode: (mode: "off" | "song" | "queue") => void;
  initializeQueue: (songs: Song[], clerkId: string,autoPlay?: boolean) => void;
  playAlbum: (songs: Song[], clerkId: string,startIndex?: number, albumId?: string) => void;
  playPlaylist: (
    songs: Song[],
    clerkId: string,
    startIndex?: number,
    playlistId?: string
  ) => void;
  setCurrentSong: (song: Song | null, clerkId: string) => void;
  togglePlay: (clerkId: string) => void;
  playNext: (clerkId: string) => void;
  playPrevious: (clerkId: string) => void;
  shuffleQueue: () => void;
  updatePlaybackPosition: (position: number) => void;
  clearQueue: (clerkId: string) => void; // Updated to sync with backend
  addPlayHistory: (
    songId: string,
    userId: string,
    playDuration: number,
    source: "queue" | "playlist" | "album" | "radio",
    sourceId?: string,
    completed?: boolean
  ) => void;
  addSkipHistory: (
    songId: string,
    userId: string,
    playDuration: number,
    skipType: "manual" | "automatic",
    reason?: string
  ) => void;
  getMongoUserId: (clerkId: string) => Promise<string>;
  addToQueue: (song: Song, userId: string) => Promise<void>;
  seekTo: (position: number) => void;
  fetchQueue: (userId: string) => Promise<void>;

  // New methods
  removeFromQueue: (userId: string, queueItemId: string) => Promise<void>;
  reorderQueue: (userId: string, newOrder: string[]) => Promise<void>;
  getSavedQueues: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<{ savedQueues: any[]; total: number }>;
  loadSavedQueue: (userId: string, savedQueueId: string) => Promise<void>;
  getListeningSessions: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<{ sessions: any[]; total: number }>;
}

// Utility to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const userIdCache = new Map<string, string>();


export const usePlayerStore = create<PlayerStore>((set, get) => ({
  audio: new Audio(),
  volume: 0.9,
  currentSong: null,
  isPlaying: false,
  queue: [],
  isShuffle: false,
  trackartist: [],
  currentIndex: -1,
  playbackPosition: 0,
  repeatMode: "queue",
  // const {userId} = useAuth(),

  fetchQueue: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/queue/${userId}`);
      const queueData = response.data.queue;
      // console.log("response.data", response.data);
      set({
        queue: queueData?.songs || [],
        currentSong:
          queueData.songs[queueData?.current_track_index] ||
          queueData.songs[0] ||
          null,
        currentIndex: queueData?.current_track_index || -1,
        isShuffle: queueData?.is_shuffle || false,
        repeatMode: queueData?.repeat_mode || "queue",
      });
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  },

  setVolume: (volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
    const { audio } = get();
    audio.volume = normalizedVolume;
    set({ volume: normalizedVolume });
  },

  saveQueue: async (userId: string, name: string, description?: string) => {
    try {
      await axiosInstance.post("/api/queue/save", {
        userId,
        name,
        description,
      });
    } catch (error) {
      console.error("Error saving queue:", error);
    }
  },

  setShuffle: (isShuffle: boolean) => set({ isShuffle }),

  setRepeatMode: (mode: "off" | "song" | "queue") => set({ repeatMode: mode }),

  getMongoUserId: async (clerkId: string) => {
    if (userIdCache.has(clerkId)) {
      return userIdCache.get(clerkId)!;
    }
    try {
      const response = await axiosInstance.get(`/users/clerk/${clerkId}`);
      const mongoId = response.data._id;
      userIdCache.set(clerkId, mongoId);
      return mongoId;
    } catch (error: any) {
      console.error(
        "Error fetching MongoDB user ID:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  playNext: async (clerkId: string) => {
    const { currentIndex, queue, currentSong, playbackPosition, repeatMode } =
      get();
    const { audio, volume, initializeQueue , setCurrentSong} = get(); 
    audio.volume = volume;
    const nextIndex = currentIndex + 1;
    const socket = useChatStore.getState().socket;

    // const clerkId = socket?.auth?.userId;
    const { fetchRandomSongs } = useMusicStore.getState(); 

    if (repeatMode === "song" && currentSong) {
      audio.currentTime = 0;
      audio.play();
      set({ playbackPosition: 0, isPlaying: true });
      return;
    }

    if (nextIndex < queue.length) {
      const nextSong = queue[nextIndex];
      if (socket?.auth) {
        const artistNames =
          nextSong.artists?.map((artist) => artist.name).join(", ") ||
          "Unknown Artist";
        socket.emit("update_activity", {
          clerkId: clerkId,
          activity: `Playing ${nextSong.title} by ${artistNames}`,
        });
      }

      try {
        await axiosInstance.post(`/songs/${nextSong._id}/stream`);
        if (clerkId) {
          const userId = await get().getMongoUserId(clerkId);
          get().addPlayHistory(
            nextSong._id,
            userId,
            nextSong.duration || 0,
            "queue",
            undefined,
            false
          );
          if (currentSong) {
            get().addSkipHistory(
              currentSong._id,
              userId,
              playbackPosition || 0,
              "manual",
              "User clicked next"
            );
          }
        }
      } catch (error: any) {
        console.log("Error in playNext", error.response?.data || error);
      }

      set({
        currentSong: nextSong,
        currentIndex: nextIndex,
        isPlaying: true,
        playbackPosition: 0,
      });
    } else if (repeatMode === "queue" && queue.length > 0) {
      const firstSong = queue[0];
      if (socket?.auth) {
        const artistNames =
          firstSong.artists?.map((artist) => artist.name).join(", ") ||
          "Unknown Artist";
        socket.emit("update_activity", {
          clerkId: clerkId,
          activity: `Playing ${firstSong.title} by ${artistNames}`,
        });
      }

      try {
        await axiosInstance.post(`/songs/${firstSong._id}/stream`);
        if (clerkId) {
          const userId = await get().getMongoUserId(clerkId);
          get().addPlayHistory(
            firstSong._id,
            userId,
            firstSong.duration || 0,
            "queue",
            undefined,
            false
          );
          if (currentSong) {
            get().addSkipHistory(
              currentSong._id,
              userId,
              playbackPosition || 0,
              "automatic",
              "Queue ended, repeating"
            );
          }
        }
      } catch (error: any) {
        console.log(
          "Error in playNext (repeat queue)",
          error.response?.data || error
        );
      }

      set({
        currentSong: firstSong,
        currentIndex: 0,
        isPlaying: true,
        playbackPosition: 0,
      });
    } else if (
      repeatMode === "off" &&
      queue.length > 0 &&
      nextIndex >= queue.length
    ) {
      // Khi repeatMode là "off" và đang ở bài cuối cùng
      try {
        // Gọi fetchRandomSongs để lấy danh sách bài hát ngẫu nhiên
        await fetchRandomSongs(1);
        const { randomSongs } = useMusicStore.getState();

        if (randomSongs.length > 0) {
          await setCurrentSong(randomSongs[0], clerkId)
          // Gọi initializeQueue với randomSongs và autoPlay = true
          await initializeQueue(randomSongs, clerkId, true);
         
          const newCurrentSong = get().currentSong;

          if (socket?.auth && newCurrentSong) {
            const artistNames =
              newCurrentSong.artists?.map((artist) => artist.name).join(", ") ||
              "Unknown Artist";
            socket.emit("update_activity", {
              clerkId: clerkId,
              activity: `Playing ${newCurrentSong.title} by ${artistNames}`,
            });
          }

          if (clerkId && newCurrentSong) {
            const userId = await get().getMongoUserId(clerkId);
            get().addPlayHistory(
              newCurrentSong._id,
              userId,
              newCurrentSong.duration || 0,
              "queue",
              undefined,
              false
            );
            if (currentSong) {
              get().addSkipHistory(
                currentSong._id,
                userId,
                playbackPosition || 0,
                "automatic",
                "Queue ended, fetching random songs"
              );
            }
          }
        } else {
          set({ isPlaying: false, playbackPosition: 0 });
          if (socket?.auth) {
            socket.emit("update_activity", {
              clerkId: clerkId,
              activity: "Idle",
            });
          }
        }
      } catch (error) {
        console.error(
          "Error fetching random songs or initializing queue:",
          error
        );
        set({ isPlaying: false, playbackPosition: 0 });
        if (socket?.auth) {
          socket.emit("update_activity", { clerkId: clerkId, activity: "Idle" });
        }
      }
    } else {
      set({ isPlaying: false, playbackPosition: 0 });
      if (socket?.auth) {
        socket.emit("update_activity", { clerkId: clerkId, activity: "Idle" });
      }
    }
  },

  addPlayHistory: async (
    songId: string,
    userId: string,
    playDuration: number,
    source: "queue" | "playlist" | "album" | "radio",
    sourceId?: string,
    completed?: boolean
  ) => {
    const validPlayDuration =
      typeof playDuration === "number" && playDuration >= 0 ? playDuration : 0;
    const payload = {
      user_id: userId,
      track_id: songId,
      play_duration: validPlayDuration,
      source,
      source_id: sourceId || null,
      completed: completed || false,
      device_info: navigator.userAgent,
      ip_address: "unknown",
    };
    try {
      await axiosInstance.post("/songs/play-history", payload);
    } catch (error: any) {
      console.error(
        "Error adding play history:",
        error.response?.data || error.message
      );
    }
  },

  addSkipHistory: async (
    songId: string,
    userId: string,
    playDuration: number,
    skipType: "manual" | "automatic",
    reason?: string
  ) => {
    const payload = {
      user_id: userId,
      track_id: songId,
      play_duration: playDuration,
      skip_type: skipType,
      reason: reason || "",
    };
    try {
      await axiosInstance.post("/songs/skip-history", payload);
    } catch (error: any) {
      console.error(
        "Error adding skip history:",
        error.response?.data || error.message
      );
    }
  },

  addToQueue: async (song: Song, userId: string) => {
    try {
      const response = await axiosInstance.post("/queue/add", {
        userId,
        track_id: song._id,
        source: "search",
      });
      set((state) => ({
        queue: [...state.queue, response.data.queueItem.track],
      }));
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  },

  clearQueue: async (clerkId: string) => {
    const { audio } = get();
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;

    if (clerkId) {
      try {
        const userId = await get().getMongoUserId(clerkId);
        await axiosInstance.delete(`/api/queue/${userId}`);
      } catch (error) {
        console.error("Error clearing queue:", error);
      }
    }

    audio.pause();
    audio.src = "";
    if (socket?.auth) {
      socket.emit("update_activity", { clerkId: clerkId, activity: "Idle" });
    }
    set({
      queue: [],
      currentSong: null,
      currentIndex: -1,
      isPlaying: false,
      playbackPosition: 0,
      repeatMode: "queue",
    });
  },

  shuffleQueue: () =>
    set((state) => {
      const { queue, currentIndex, currentSong } = state;
      if (!currentSong || queue.length === 0 || currentIndex === -1) {
        return state;
      }
      const beforeCurrent = queue.slice(0, currentIndex + 1);
      const afterCurrent = queue.slice(currentIndex + 1);
      const shuffledAfter = shuffleArray(afterCurrent);
      const newQueue = [...beforeCurrent, ...shuffledAfter];
      return { queue: newQueue, currentIndex };
    }),

  updatePlaybackPosition: (position) => set({ playbackPosition: position }),

  seekTo: (position: number) => {
    const { audio } = get();
    const boundedPosition = Math.max(
      0,
      Math.min(position, audio.duration || Infinity)
    );
    audio.currentTime = boundedPosition;
    set({ playbackPosition: boundedPosition });
  },

  // usePlayerStore.ts
  initializeQueue: async (songs: Song[], clerkId: string, autoPlay: boolean = false) => {
    const { audio, currentIndex } = get();
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId
    

    if (!clerkId) {
      set({
        queue: songs,
        currentSong: get().currentSong || songs[currentIndex]|| songs[0] || null,
        // currentIndex: 0,
        playbackPosition: 0,
        isPlaying: autoPlay,
      });
      if (autoPlay && songs[0]) {
        audio.src = songs[0].audioUrl;
        audio.play();
      }
      return;
    }

    try {
      const userId = await get().getMongoUserId(clerkId);
      const songIds = songs.map((song) => song._id);
      const response = await axiosInstance.post("/queue/initialize", {
        userId,
        songs: songIds,
        source: "manual", 
      });
      const queueData = response.data.queue;

      set({
        queue: queueData.songs,
        currentSong: get().currentSong || queueData.songs[0] || null,
        currentIndex: 0,
        playbackPosition: 0,
        isPlaying: autoPlay,
        isShuffle: queueData.is_shuffle || false,
        repeatMode: queueData.repeat_mode || "off",
      });

      if (autoPlay && queueData.songs[0]) {
        audio.src = queueData.songs[0].audioUrl;
        audio.play();
        const artistName =
          queueData.songs[0].artists[0]?.name || "Unknown Artist";
        socket?.emit("update_activity", {
          clerkId: clerkId,
          activity: `Playing ${queueData.songs[0].title} by ${artistName}`,
        });
        get().addPlayHistory(
          queueData.songs[0]._id,
          userId,
          queueData.songs[0].duration || 0,
          "queue",
          undefined,
          false
        );
      }
    } catch (error) {
      console.error("Error initializing queue:", error);
      set({
        queue: songs,
        currentSong: get().currentSong || songs[0] || null,
        currentIndex: 0,
        playbackPosition: 0,
        isPlaying: autoPlay,
        repeatMode: "off",
      });
      if (autoPlay && songs[0]) {
        audio.src = songs[0].audioUrl;
        audio.play();
      }
    }
  },

  playPlaylist: async (tracks: Song[], clerkId: string,startIndex = 0, playlistId?: string) => {
    if (tracks.length === 0) return;
    const song = tracks[startIndex];
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;

    if (socket?.auth) {
      const artistName =
        song.artists.length > 0 ? song.artists[0].name : "Unknown Artist";
      socket.emit("update_activity", {
        clerkId: clerkId,
        activity: `Playing ${song.title} by ${artistName}`,
      });
    }

    try {
      await axiosInstance.post(`/songs/${song._id}/stream`);
      if (clerkId) {
        const userId = await get().getMongoUserId(clerkId);
        get().addPlayHistory(
          song._id,
          userId,
          song.duration || 0,
          "playlist",
          playlistId,
          false
        );
      }
    } catch (error: any) {
      console.log("Error in playPlaylist:", error.response?.data || error);
    }

    set({
      queue: tracks,
      currentSong: song,
      currentIndex: startIndex,
      isPlaying: true,
      playbackPosition: 0,
    });
  },

  playAlbum: async (songs: Song[], clerkId: string,startIndex = 0, albumId?: string) => {
    if (songs.length === 0) return;
    const song = songs[startIndex];
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;

    if (socket?.auth) {
      const artistName =
        song.artists.length > 0 ? song.artists[0].name : "Unknown Artist";
      socket.emit("update_activity", {
        clerkId: clerkId,
        activity: `Playing ${song.title} by ${artistName}`,
      });
    }

    try {
      await axiosInstance.post(`/songs/${song._id}/stream`);
      if (clerkId) {
        const userId = await get().getMongoUserId(clerkId);
        get().addPlayHistory(song._id, userId, song.duration || 0, "album", albumId, false);
      }
    } catch (error: any) {
      console.log("Error in playAlbum:", error.response?.data || error);
    }

    set({
      queue: songs,
      currentSong: song,
      currentIndex: startIndex,
      isPlaying: true,
      playbackPosition: 0,
    });
  },

  setCurrentSong: async (song: Song | null, clerkId: string) => {
    if (!song) return;
    const { audio, volume } = get();
    if (song) audio.volume = volume;
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;

    if (socket?.auth) {
      const artistName =
        song.artists.length > 0 ? song.artists[0].name : "Unknown Artist";
      socket.emit("update_activity", {
        clerkId: clerkId,
        activity: `Playing ${song.title} by ${artistName}`,
      });
    }

    const songIndex = get().queue.findIndex((s) => s._id === song._id);
    try {
      await axiosInstance.post(`/songs/${song._id}/stream`);
      if (clerkId) {
        const userId = await get().getMongoUserId(clerkId);
        get().addPlayHistory(song._id, userId, song.duration || 0, "queue", undefined, false);
      }
    } catch (error: any) {
      console.log("Error in setCurrentSong:", error.response?.data || error);
    }

    set({
      currentSong: song,
      isPlaying: true,
      currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
      playbackPosition: 0,
    });
  },

  togglePlay: (clerkId: string) => {
    const willStartPlaying = !get().isPlaying;
    const { audio, volume, currentSong } = get();
    audio.volume = volume;
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;

    if (socket?.auth && currentSong) {
      const artistNames =
        currentSong.artists?.map((artist) => artist.name).join(", ") ||
        "Unknown Artist";
      socket.emit("update_activity", {
        clerkId: clerkId,
        activity: willStartPlaying
          ? `Playing ${currentSong.title} by ${artistNames}`
          : "Idle",
      });
    }

    if (willStartPlaying && currentSong && clerkId) {
      (async () => {
        try {
          const userId = await get().getMongoUserId(clerkId);
          const playbackPosition = get().playbackPosition ?? 0;
          get().addPlayHistory(
            currentSong._id,
            userId,
            currentSong.duration || playbackPosition || 0,
            "queue",
            undefined,
            false
          );
        } catch (error: any) {
          console.log(
            "Error in togglePlay history:",
            error.response?.data || error
          );
        }
      })();
    }

    set({ isPlaying: willStartPlaying });
  },

  playPrevious: async (clerkId: string) => {
    const { currentIndex, queue } = get();
    const { audio, volume } = get();
    audio.volume = volume;
    const prevIndex = currentIndex - 1;
    const socket = useChatStore.getState().socket;
    // const clerkId = socket?.auth?.userId;


    if (prevIndex >= 0) {
      const prevSong = queue[prevIndex];
      if (socket?.auth) {
        const artistNames =
          prevSong.artists?.map((artist) => artist.name).join(", ") ||
          "Unknown Artist";
        socket.emit("update_activity", {
          clerkId: clerkId,
          activity: `Playing ${prevSong.title} by ${artistNames}`,
        });
      }

      try {
        await axiosInstance.post(`/songs/${prevSong._id}/stream`);
        if (clerkId) {
          const userId = await get().getMongoUserId(clerkId);
          get().addPlayHistory(
            prevSong._id,
            userId,
            prevSong.duration || 0,
            "queue",
            undefined,
            false
          );
        }
      } catch (error: any) {
        console.log("Error in playPrevious:", error.response?.data || error);
      }

      set({
        currentSong: prevSong,
        currentIndex: prevIndex,
        isPlaying: true,
        playbackPosition: 0,
      });
    } else {
      set({ isPlaying: false, playbackPosition: 0 });
      if (socket?.auth) {
        socket.emit("update_activity", { clerkId: clerkId, activity: "Idle" });
      }
    }
  },

  // New method implementations
  removeFromQueue: async (userId: string, queueItemId: string) => {
    try {
      await axiosInstance.delete(`/api/queue/${userId}/${queueItemId}`);
      set((state) => {
        const newQueue = state.queue.filter((song, index) => {
          console.log("song._id:", song._id);
          // Assuming queueItemId corresponds to song._id or a unique identifier in the queue
          // You might need to adjust this logic based on how queueItemId is mapped to songs
          return state.queue.findIndex((s) => s._id === queueItemId) !== index;
        });
        const newIndex =
          state.currentIndex >= newQueue.length
            ? newQueue.length - 1
            : state.currentIndex;
        return { queue: newQueue, currentIndex: newIndex };
      });
    } catch (error) {
      console.error("Error removing from queue:", error);
    }
  },

  reorderQueue: async (userId: string, newOrder: string[]) => {
    try {
      await axiosInstance.put(`/api/queue/${userId}/reorder`, { newOrder });
      set((state) => {
        const newQueue = newOrder
          .map((id) => state.queue.find((song) => song._id === id)!)
          .filter(Boolean);
        return { queue: newQueue };
      });
    } catch (error) {
      console.error("Error reordering queue:", error);
    }
  },

  getSavedQueues: async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    try {
      const response = await axiosInstance.get(`/api/saved-queues/${userId}`, {
        params: { page, limit },
      });
      return {
        savedQueues: response.data.savedQueues,
        total: response.data.total,
      };
    } catch (error) {
      console.error("Error fetching saved queues:", error);
      return { savedQueues: [], total: 0 };
    }
  },

  loadSavedQueue: async (userId: string, savedQueueId: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/saved-queues/${userId}/${savedQueueId}/load`
      );
      const queueData = response.data.queue;
      set({
        queue: queueData.songs,
        currentIndex: queueData.current_track_index || 0,
        isShuffle: queueData.is_shuffle || false,
        repeatMode: queueData.repeat_mode || "queue",
        currentSong: queueData.songs[0] || null,
        isPlaying: false,
        playbackPosition: 0,
      });
    } catch (error) {
      console.error("Error loading saved queue:", error);
    }
  },

  getListeningSessions: async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    try {
      const response = await axiosInstance.get(`/api/sessions/${userId}`, {
        params: { page, limit },
      });
      return {
        sessions: response.data.sessions,
        total: response.data.total,
      };
    } catch (error) {
      console.error("Error fetching listening sessions:", error);
      return { sessions: [], total: 0 };
    }
  },
}));

const { audio } = usePlayerStore.getState();
audio.addEventListener("timeupdate", () => {
  const { updatePlaybackPosition, isPlaying } = usePlayerStore.getState();
  if (isPlaying) {
    updatePlaybackPosition(audio.currentTime);
  }
});
audio.addEventListener("ended", () => {
  const { playNext } = usePlayerStore.getState();
  const {info} = useChatStore.getState();
  const {userId} = useAuth();
  playNext(userId || info?.clerkId || "");
});

usePlayerStore.subscribe((state) => {
  if (state.currentSong && state.currentSong.audioUrl !== state.audio.src) {
    state.audio.src = state.currentSong.audioUrl;
    state.audio.play();
  }
  if (state.isPlaying && state.audio.paused) {
    state.audio.play();
  } else if (!state.isPlaying && !state.audio.paused) {
    state.audio.pause();
  }
});
