import { axiosInstance } from "@/lib/axios";
import {
  Album,
  AlbumTrack,
  Artist,
  Genre,
  Instrument,
  PlayHistory,
  Playlist,
  Review,
  SkipHistory,
  Song,
  Stats,
  TrackArtist,
  TrackGenre,
  TrackInstrument,
} from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface PieChartStreamItem {
  month: string;
  streams: number;
  fill: string;
}

interface PieChartLikeItem {
  month: string;
  likes: number;
  fill: string;
}

interface MusicStore {
  songs: Song[];
  favorites: Song[];
  relatedSongs: Song[];
  relatedAlbums: Album[];
  playlists: Playlist[];
  totalSongs: number;
  totalArtistPages: number;
  currentArtistPage: number;
  currentAlbumPage: number;
  currentPage: number;
  songsPerPage: number;
  totalPages: number;
  totalAlbumPages: number;
  albums: Album[];
  artists: Artist[];
  isLoading: boolean;
  error: string | null;
  currentSong: Song | null;
  currentAlbum: Album | null;
  currentArtist: Artist | null;
  songsByArtists: Song[];
  randomSongs: Song[];
  songByGenres: Song[];
  songByInstruments: Song[];
  recentSongs: Song[];
  featuredSongs: Song[];
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  stats: Stats;
  genres: Genre[];
  instruments: Instrument[];
  trackartists: TrackArtist[];
  trackgenres: TrackGenre[];
  trackinstruments: TrackInstrument[];
  albumtracks: AlbumTrack[];
  // Thêm state mới (tùy chọn)
  currentPlaylist: Playlist | null;

  // New state for play and skip histories
  playHistory: PlayHistory[];
  skipHistory: SkipHistory[];
  playHistoryTotal: number;
  skipHistoryTotal: number;
  playHistoryPage: number;
  skipHistoryPage: number;
  playHistoryLimit: number;
  skipHistoryLimit: number;
  totalPlaylists: number;

  currentPlaylistPage: number;
  songsPerPlaylistPage: number;
  totalPlaylistPages: number;

  reviews: Review[]; // Danh sách tất cả review
  currentReview: Review | null; // Review hiện tại (nếu cần xem chi tiết)
  totalReviews: number; // Tổng số review
  reviewsPerPage: number; // Số review mỗi trang
  currentReviewPage: number; // Trang hiện tại của review

  chartData: (
    | { date: string; streams: number; likes: number }
    | { month: string; streams: number; likes: number }
  )[];

  fetchSongByArtist: (
    id: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchAlbums: (page?: number, limit?: number) => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchRandomSongs: (limit?: number) => Promise<void>;
  fetchSongByGenres: (
    id: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchSongByInstruments: (
    id: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchRecentSongs: (page?: number, limit?: number) => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchTrendingSongs: (page?: number, limit?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  songsCache: { [page: number]: Song[] };
  fetchSongs: (page?: number, limit?: number) => Promise<void>;
  fetchPlaylists: (page?: number, limit?: number) => Promise<void>;
  fetchTrackArtist: () => Promise<void>;
  fetchTrackGenre: () => Promise<void>;
  fetchTrackInstrument: () => Promise<void>;
  fetchAlbumTracks: () => Promise<void>;
  fetchSongById: (id: string) => Promise<void>;
  fetchArtists: (page?: number, limit?: number) => Promise<void>;
  fetchArtistById: (id: string) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  addSong: (newSongData: FormData) => Promise<void>;
  addPlaylist: (newPlaylistData: FormData) => Promise<Playlist>;
  updateSong: (id: string, songData: FormData) => Promise<void>;
  addAlbum: (newAlbumData: FormData) => Promise<Album>;
  addArtist: (newArtistData: FormData) => Promise<Artist>;
  addGenre: (newGenreData: FormData) => Promise<void>;
  deleteArtist: (id: string) => Promise<void>;
  fetchGenres: () => Promise<void>;
  fetchInstruments: () => Promise<void>;
  addInstrument: (newInstrumentData: FormData) => Promise<void>;
  addSongToFavorites: (userId: string, trackId: string) => Promise<void>;
  removeSongFromFavorites: (userId: string, trackId: string) => Promise<void>;
  fetchUserFavorites: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  preloadHomePageData: (userId: string) => Promise<void>;

  fetchPlayHistoryByUser: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  deletePlayHistory: (id: string) => Promise<void>;
  fetchSkipHistoryByUser: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  deleteSkipHistory: (id: string) => Promise<void>;

  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string
  ) => Promise<void>;
  // Thêm phương thức mới
  getPlaylistById: (id: string) => Promise<void>;
  getRelatedSongs: (songId: string, limit: number) => Promise<void>;
  getRelatedAlbums: (albumId: string, limit: number) => Promise<void>;

  // Thêm phương thức mới cho Review
  fetchReviews: (page?: number, limit?: number) => Promise<void>; // Lấy tất cả review
  fetchReviewsBySong: (
    songId: string,
    page?: number,
    limit?: number
  ) => Promise<void>; // Lấy review theo bài hát
  fetchReviewsByUser: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<void>; // Lấy review theo user
  addReview: (reviewData: {
    user_id: string;
    song_id: string;
    rating: number;
    comment?: string;
  }) => Promise<void>; // Thêm review
  updateReview: (
    reviewId: string,
    reviewData: { rating?: number; comment?: string }
  ) => Promise<void>; // Sửa review
  deleteReview: (reviewId: string) => Promise<void>; // Xóa review
  chartDataCache: {
    [key in "7d" | "30d" | "90d"]?: {
      data: { date: string; streams: number; likes: number }[];
      timestamp: number; // Thời gian cache được tạo (milliseconds)
    };
  };
  clearChartDataCache: () => void;
  fetchChartData: (options?: {
    timeRange?: "7d" | "30d" | "90d";
    groupBy?: "day" | "month";
  }) => Promise<void>;
  // Thêm state mới cho RadarChart
  radarChartData: { month: string; streams: number; likes: number }[];
  radarChartDataCache: {
    data?: { month: string; streams: number; likes: number }[];
    timestamp?: number;
  };
  // Thêm hàm mới cho RadarChart
  fetchRadarChartData: () => Promise<void>;
  clearRadarChartDataCache: () => void;

  // Thêm state mới cho PieChart
  pieChartStreamsData: { month: string; streams: number; fill: string }[];
  pieChartLikesData: { month: string; likes: number; fill: string }[];
  pieChartDataCache: {
    streamsData?: { month: string; streams: number; fill: string }[];
    likesData?: { month: string; likes: number; fill: string }[];
    timestamp?: number;
  };

  // Thêm hàm mới cho PieChart
  fetchPieChartData: () => Promise<void>;
  clearPieChartDataCache: () => void;

  searchResults: Song[]; // Lưu trữ kết quả tìm kiếm
  searchTotal: number; // Tổng số kết quả tìm kiếm
  searchPage: number; // Trang hiện tại của kết quả tìm kiếm
  searchLimit: number; // Số bài hát mỗi trang tìm kiếm
  searchTotalPages: number; // Tổng số trang tìm kiếm

  fetchSearchSongs: (
    query: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
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
export const useMusicStore = create<MusicStore>((set, get) => ({
  albums: [],
  songs: [],
  songsByArtists: [],
  randomSongs: [],
  songByGenres: [],
  songByInstruments: [],
  relatedSongs: [],
  relatedAlbums: [],
  favorites: [],
  playlists: [],
  totalSongs: 0,
  totalPlaylists: 0,
  currentArtistPage: 1,
  totalArtistPages: 1,
  currentAlbumPage: 1,
  totalAlbumPages: 1,
  currentPlaylistPage: 1,
  songsPerPlaylistPage: 20,
  totalPlaylistPages: 1,
  currentPage: 1,
  songsPerPage: 20,
  totalPages: 0,
  artists: [],
  genres: [],
  instruments: [],
  trackartists: [],
  trackinstruments: [],
  albumtracks: [],
  trackgenres: [],
  isLoading: false,
  error: null,
  currentAlbum: null,
  currentSong: null,
  currentArtist: null,
  currentPlaylist: null,
  recentSongs: [],
  madeForYouSongs: [],
  featuredSongs: [],
  trendingSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0,
    totalGenres: 0,
    totalInstruments: 0,
  },

  // Giá trị mặc định cho state mới
  reviews: [],
  currentReview: null,
  totalReviews: 0,
  reviewsPerPage: 10,
  currentReviewPage: 1,

  playHistory: [],
  skipHistory: [],
  playHistoryTotal: 0,
  skipHistoryTotal: 0,
  playHistoryPage: 1,
  skipHistoryPage: 1,
  playHistoryLimit: 10,
  skipHistoryLimit: 10,

  songsCache: {},

  chartDataCache: {}, // Khởi tạo cache rỗng
  chartData: [],
  radarChartData: [],
  radarChartDataCache: {},

  pieChartStreamsData: [],
  pieChartLikesData: [],
  pieChartDataCache: {},

  searchResults: [],
  searchTotal: 0,
  searchPage: 1,
  searchLimit: 20,
  searchTotalPages: 0,

  fetchSearchSongs: async (query: string, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        set({
          searchResults: [],
          searchTotal: 0,
          searchPage: 1,
          searchLimit: limit,
          searchTotalPages: 0,
          isLoading: false,
        });
        return;
      }

      const response = await axiosInstance.get("/songs/search", {
        params: { query, page, limit },
      });

      set({
        searchResults: response.data.songs || [],
        searchTotal: response.data.total || 0,
        searchPage: response.data.page || page,
        searchLimit: response.data.limit || limit,
        searchTotalPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || 0) / limit),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch search results";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  fetchPieChartData: async () => {
    try {
      set({ isLoading: true, error: null });

      const cacheTTL = 60 * 60 * 1000; // 1 hour
      const cachedEntry = get().pieChartDataCache;
      if (
        cachedEntry.streamsData &&
        cachedEntry.likesData &&
        cachedEntry.timestamp &&
        Date.now() - cachedEntry.timestamp < cacheTTL
      ) {
        console.log("Using cached pie chart data");
        set({
          pieChartStreamsData: cachedEntry.streamsData,
          pieChartLikesData: cachedEntry.likesData,
          isLoading: false,
        });
        return;
      }

      const response = await axiosInstance.get("/stats/pie-chart-data");

      const isValidData =
        response.data &&
        Array.isArray(response.data.streamsData) &&
        Array.isArray(response.data.likesData) &&
        response.data.streamsData.every(
          (item: PieChartStreamItem) =>
            item &&
            typeof item === "object" &&
            typeof item.month === "string" &&
            typeof item.streams === "number" &&
            typeof item.fill === "string"
        ) &&
        response.data.likesData.every(
          (item: PieChartLikeItem) =>
            item &&
            typeof item === "object" &&
            typeof item.month === "string" &&
            typeof item.likes === "number" &&
            typeof item.fill === "string"
        );

      if (!isValidData) {
        throw new Error("Invalid pie chart data format received from server");
      }

      set({
        pieChartStreamsData: response.data.streamsData,
        pieChartLikesData: response.data.likesData,
        pieChartDataCache: {
          streamsData: response.data.streamsData,
          likesData: response.data.likesData,
          timestamp: Date.now(),
        },
        isLoading: false,
      });

      console.log("Pie chart data received:", response.data);
    } catch (error: any) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Failed to fetch pie chart data";
      console.error("Pie chart data fetch error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      showErrorToast(errorMessage);
    }
  },

  clearPieChartDataCache: () => {
    set({
      pieChartDataCache: {},
      pieChartStreamsData: [],
      pieChartLikesData: [],
    });
    console.log("Pie chart data cache cleared");
  },

  fetchRadarChartData: async () => {
    try {
      set({ isLoading: true, error: null });

      // Kiểm tra cache
      const cacheTTL = 60 * 60 * 1000; // 1 giờ
      const cachedEntry = get().radarChartDataCache;
      if (
        cachedEntry.data &&
        cachedEntry.timestamp &&
        Date.now() - cachedEntry.timestamp < cacheTTL
      ) {
        console.log("Using cached radar chart data");
        set({
          radarChartData: cachedEntry.data,
          isLoading: false,
        });
        return;
      }

      // Gọi API
      const response = await axiosInstance.get("/stats/radar-chart-data");

      // Xác thực dữ liệu
      const isValidData =
        Array.isArray(response.data) &&
        response.data.every(
          (item) =>
            item &&
            typeof item === "object" &&
            "month" in item &&
            typeof item.streams === "number" &&
            typeof item.likes === "number"
        );

      if (!isValidData) {
        throw new Error("Invalid radar chart data format received from server");
      }

      // Cập nhật cache và state
      set({
        radarChartData: response.data,
        radarChartDataCache: {
          data: response.data,
          timestamp: Date.now(),
        },
        isLoading: false,
      });

      console.log("Radar chart data received:", response.data);
    } catch (error: any) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Failed to fetch radar chart data";
      console.error("Radar chart data fetch error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      showErrorToast(errorMessage);
    }
  },

  clearRadarChartDataCache: () => {
    set({ radarChartDataCache: {}, radarChartData: [] });
    console.log("Radar chart data cache cleared");
  },
  clearChartDataCache: () => {
    set({ chartDataCache: {}, chartData: [] });
    console.log("Chart data cache cleared");
  },

  fetchChartData: async (options = {}) => {
    const { timeRange = "7d", groupBy = "day" } = options;
    try {
      set({ isLoading: true, error: null });

      // Định nghĩa TTL (1 giờ = 60 * 60 * 1000 milliseconds)
      const cacheTTL = 60 * 60 * 1000;

      // Kiểm tra cache
      const cachedEntry = get().chartDataCache[timeRange];
      if (
        cachedEntry &&
        groupBy === "day" &&
        Date.now() - cachedEntry.timestamp < cacheTTL
      ) {
        console.log(`Using cached chart data for timeRange: ${timeRange}`);
        set({
          chartData: cachedEntry.data,
          isLoading: false,
        });
        return;
      }

      // Tính toán khoảng thời gian
      const endDate = new Date();
      const startDate = new Date();
      if (groupBy === "month") {
        startDate.setMonth(endDate.getMonth() - 6);
      } else if (timeRange === "7d") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === "30d") {
        startDate.setDate(endDate.getDate() - 30);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      // Gọi API
      const response = await axiosInstance.get("/stats/chart-data", {
        params: { startDate: startDateStr, endDate: endDateStr, groupBy },
      });

      console.log("Chart data received:", response.data);

      // Xác thực dữ liệu nếu groupBy là "day"
      if (groupBy === "day") {
        const isValidData =
          Array.isArray(response.data) &&
          response.data.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "date" in item &&
              typeof item.streams === "number" &&
              typeof item.likes === "number" &&
              !isNaN(new Date(item.date).getTime())
          );

        if (isValidData) {
          set((state) => ({
            chartData: response.data,
            chartDataCache: {
              ...state.chartDataCache,
              [timeRange]: {
                data: response.data,
                timestamp: Date.now(),
              },
            },
            isLoading: false,
          }));
        } else {
          throw new Error("Invalid chart data format received from server");
        }
      } else {
        // Không lưu cache cho groupBy: "month"
        set({
          chartData: response.data,
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Failed to fetch chart data";
      console.error("Chart data fetch error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      showErrorToast(errorMessage);
    }
  },

  preloadHomePageData: async (userId: string) => {
    const { fetchFeaturedSongs, fetchUserFavorites } = get();
    try {
      // Tải dữ liệu quan trọng trước
      const promises = [fetchFeaturedSongs()];
      if (userId) {
        promises.push(fetchUserFavorites(userId, 1, 400));
      }
      await Promise.all(promises);

      // Tải dữ liệu phụ sau
      setTimeout(async () => {
        await Promise.all([
          get().fetchRecentSongs(1, 18),
          get().fetchTrendingSongs(1, 12),
          get().fetchArtists(1, 18),
          get().fetchAlbums(1, 18),
          get().fetchPlaylists(1, 30),
        ]);
      }, 50); // Delay nhẹ để ưu tiên dữ liệu chính
    } catch (error) {
      console.error("Error preloading home page data:", error);
    }
  },

  // Lấy tất cả review
  fetchReviews: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/search/reviews?page=${page}&limit=${limit}`
      );
      set({
        reviews: response.data.reviews,
        totalReviews: response.data.total,
        currentReviewPage: response.data.page,
        reviewsPerPage: response.data.limit,
        totalPages:
          response.data.totalPages || Math.ceil(response.data.total / limit),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch reviews";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  // Lấy review theo bài hát
  fetchReviewsBySong: async (songId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/search/reviews/song/${songId}?page=${page}&limit=${limit}`
      );
      set({
        reviews: response.data.reviews,
        totalReviews: response.data.total,
        currentReviewPage: response.data.page,
        reviewsPerPage: response.data.limit,
        totalPages:
          response.data.totalPages || Math.ceil(response.data.total / limit),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch reviews for song";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  // Lấy review theo user
  fetchReviewsByUser: async (userId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/search/reviews/user/${userId}?page=${page}&limit=${limit}`
      );
      set({
        reviews: response.data.reviews,
        totalReviews: response.data.total,
        currentReviewPage: response.data.page,
        reviewsPerPage: response.data.limit,
        totalPages:
          response.data.totalPages || Math.ceil(response.data.total / limit),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch reviews for user";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  // Thêm review mới
  addReview: async (reviewData: {
    user_id: string;
    song_id: string;
    rating: number;
    comment?: string;
  }) => {
    // set({ isLoading: true, error: null });
    try {
      // console.log("Sending review data to backend:", reviewData);
      const response = await axiosInstance.post("/search/reviews", reviewData);
      const newReview = response.data;
      // console.log("New review added:", newReview);
      set((state) => ({
        reviews: [...state.reviews, newReview],
        totalReviews: state.totalReviews + 1,
        isLoading: false,
      }));
      // const song = get().songs.find((s) => s._id === reviewData.song_id);
      // if (song) {
      //   const updatedReviews = [...get().reviews.filter((r) => r.song_id === reviewData.song_id), newReview];
      //   const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      //   set((state) => ({
      //     songs: state.songs.map((s) =>
      //       s._id === reviewData.song_id ? { ...s, average_rating: newAverageRating } : s
      //     ),
      //     currentSong: state.currentSong?._id === reviewData.song_id
      //       ? { ...state.currentSong, average_rating: newAverageRating }
      //       : state.currentSong,
      //   }));
      // }
      showSuccessToast("Review added successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to add review";
      console.error("Error adding review:", error.response?.data || error);
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  // Sửa review
  updateReview: async (
    reviewId: string,
    reviewData: { rating?: number; comment?: string }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/search/reviews/${reviewId}`,
        reviewData
      );
      const updatedReview = response.data;
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r._id === reviewId ? updatedReview : r
        ),
        currentReview:
          state.currentReview?._id === reviewId
            ? updatedReview
            : state.currentReview,
        isLoading: false,
      }));
      // Cập nhật average_rating của bài hát nếu rating thay đổi
      if (reviewData.rating !== undefined) {
        const songId =
          typeof updatedReview.song_id === "string"
            ? updatedReview.song_id
            : updatedReview.song_id._id;
        const updatedReviews = get().reviews.map((r) =>
          r._id === reviewId ? updatedReview : r
        );
        const songReviews = updatedReviews.filter(
          (r) =>
            (typeof r.song_id === "string" ? r.song_id : r.song_id._id) ===
            songId
        );
        const newAverageRating =
          songReviews.length > 0
            ? songReviews.reduce((sum, r) => sum + r.rating, 0) /
              songReviews.length
            : 0;

        set((state) => ({
          songs: state.songs.map((s) =>
            s._id === songId ? { ...s, average_rating: newAverageRating } : s
          ),
          currentSong:
            state.currentSong && state.currentSong._id === songId
              ? { ...state.currentSong, average_rating: newAverageRating }
              : state.currentSong,
        }));
      }
      showSuccessToast("Review updated successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update review";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  // Xóa review
  deleteReview: async (reviewId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/search/reviews/${reviewId}`);
      const deletedReview = get().reviews.find((r) => r._id === reviewId);
      set((state) => ({
        reviews: state.reviews.filter((r) => r._id !== reviewId),
        totalReviews: state.totalReviews - 1,
        currentReview:
          state.currentReview?._id === reviewId ? null : state.currentReview,
        isLoading: false,
      }));
      // Cập nhật average_rating của bài hát sau khi xóa
      if (deletedReview) {
        const songId = deletedReview.song_id;
        const remainingReviews = get().reviews.filter(
          (r) => r.song_id === songId
        );
        const newAverageRating =
          remainingReviews.length > 0
            ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) /
              remainingReviews.length
            : 0;
        set((state) => ({
          songs: state.songs.map((s) =>
            s._id === songId ? { ...s, average_rating: newAverageRating } : s
          ),
          currentSong:
            state.currentSong?._id === songId
              ? { ...state.currentSong, average_rating: newAverageRating }
              : state.currentSong,
        }));
      }
      showSuccessToast("Review deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete review";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  getRelatedAlbums: async (albumId: string, limit: number = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/albums/${albumId}/related`, {
        params: { limit },
      });
      set({ relatedAlbums: response.data.relatedAlbums, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch related albums";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  getRelatedSongs: async (songId: string, limit: number = 6) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/songs/${songId}/related`, {
        params: { limit },
      });
      set({ relatedSongs: response.data.relatedSongs, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch related songs";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  getPlaylistById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Fetching playlist with ID:", id);
      const response = await axiosInstance.get(`/songs/playlists/${id}`);
      const playlist: Playlist = response.data; // Ép kiểu thành Playlist

      // Kiểm tra dữ liệu trả về
      if (!playlist || !playlist._id) {
        throw new Error("Invalid playlist data received from server");
      }

      // Cập nhật state
      set((state) => ({
        currentPlaylist: playlist,
        // Tùy chọn: Đồng bộ với danh sách playlists nếu cần
        playlists: state.playlists.some((p) => p._id === id)
          ? state.playlists.map((p) => (p._id === id ? playlist : p))
          : [...state.playlists, playlist], // Thêm nếu chưa có trong danh sách
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch playlist";
      console.error("Error fetching playlist:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        error,
      });
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    set({ isLoading: true, error: null });

    // Optimistic update
    set((state) => {
      const songToAdd = state.songs.find((song: Song) => song._id === trackId);
      if (!songToAdd) return state;

      return {
        ...state,
        playlists: state.playlists.map((p: Playlist) =>
          p._id === playlistId
            ? {
                ...p,
                tracks: [...(p.tracks || []), songToAdd],
                total_tracks: (p.total_tracks || 0) + 1,
              }
            : p
        ),
        currentPlaylist:
          state.currentPlaylist?._id === playlistId
            ? {
                ...state.currentPlaylist,
                tracks: [...(state.currentPlaylist.tracks || []), songToAdd],
                total_tracks: (state.currentPlaylist.total_tracks || 0) + 1,
              }
            : state.currentPlaylist,
      };
    });

    try {
      const response = await axiosInstance.post("/songs/playlists/add-track", {
        playlistId,
        trackId,
      });
      const updatedPlaylist: Playlist = response.data;

      // Đồng bộ lại state với dữ liệu từ server
      set((state) => ({
        playlists: state.playlists.map((p: Playlist) =>
          p._id === playlistId ? updatedPlaylist : p
        ),
        currentPlaylist:
          state.currentPlaylist?._id === playlistId
            ? updatedPlaylist
            : state.currentPlaylist,
      }));
      showSuccessToast("Track added to playlist successfully");
    } catch (error: any) {
      // Rollback nếu API thất bại
      set((state) => ({
        playlists: state.playlists.map((p: Playlist) =>
          p._id === playlistId
            ? {
                ...p,
                tracks: (p.tracks || []).filter((t: Song) => t._id !== trackId),
                total_tracks: Math.max((p.total_tracks || 0) - 1, 0),
              }
            : p
        ),
        currentPlaylist:
          state.currentPlaylist?._id === playlistId
            ? {
                ...state.currentPlaylist,
                tracks: (state.currentPlaylist.tracks || []).filter(
                  (t: Song) => t._id !== trackId
                ),
                total_tracks: Math.max(
                  (state.currentPlaylist.total_tracks || 0) - 1,
                  0
                ),
              }
            : state.currentPlaylist,
      }));
      const errorMessage =
        error.response?.data?.message || "Failed to add track to playlist";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    set({ isLoading: true, error: null });

    // Lưu trạng thái trước để rollback nếu cần
    const previousState = get();

    // Optimistic update: Chỉ cập nhật currentPlaylist
    set((state) => {
      if (state.currentPlaylist?._id !== playlistId) {
        return state;
      }

      const updatedTracks = (state.currentPlaylist.tracks || []).filter(
        (track) => track._id !== trackId
      );

      return {
        ...state,
        currentPlaylist: {
          ...state.currentPlaylist,
          tracks: updatedTracks,
          total_tracks: (state.currentPlaylist.total_tracks || 0) - 1,
        },
        isLoading: false,
      };
    });

    try {
      const response = await axiosInstance.post(
        "/songs/playlists/remove-track",
        {
          playlistId,
          trackId,
        }
      );
      const updatedPlaylist: Playlist = response.data;

      // Đồng bộ currentPlaylist với dữ liệu từ server
      set((state) => {
        if (state.currentPlaylist?._id !== playlistId) {
          return state;
        }
        return {
          ...state,
          currentPlaylist: {
            ...state.currentPlaylist, // Giữ lại các trường cũ
            ...updatedPlaylist, // Ghi đè các trường từ response
            tracks: updatedPlaylist.tracks || state.currentPlaylist.tracks, // Sử dụng tracks từ response, nếu không có thì giữ nguyên
          },
          isLoading: false,
        };
      });
      showSuccessToast("Track removed from playlist successfully");
    } catch (error: any) {
      // Rollback nếu thất bại
      set((state) => ({
        ...state,
        currentPlaylist: previousState.currentPlaylist,
        isLoading: false,
      }));
      const errorMessage =
        error.response?.data?.message || "Failed to remove track from playlist";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    }
  },
  // New methods
  fetchPlayHistoryByUser: async (userId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/play-history/${userId}`,
        {
          params: { page, limit },
        }
      );
      const {
        playHistory,
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
      } = response.data;
      set({
        playHistory,
        playHistoryTotal: total,
        playHistoryPage: currentPage,
        playHistoryLimit: currentLimit,
        totalPages, // Update totalPages for consistency with your store
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch play history";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  deletePlayHistory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/songs/play-history/${id}`);
      set((state) => ({
        playHistory: state.playHistory.filter((history) => history._id !== id),
        playHistoryTotal: state.playHistoryTotal - 1,
        isLoading: false,
      }));
      showSuccessToast("Play history deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete play history";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  fetchSkipHistoryByUser: async (userId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/skip-history/${userId}`,
        {
          params: { page, limit },
        }
      );
      const {
        skipHistory,
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
      } = response.data;
      set({
        skipHistory,
        skipHistoryTotal: total,
        skipHistoryPage: currentPage,
        skipHistoryLimit: currentLimit,
        totalPages, // Update totalPages for consistency
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch skip history";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  deleteSkipHistory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/songs/skip-history/${id}`);
      set((state) => ({
        skipHistory: state.skipHistory.filter((history) => history._id !== id),
        skipHistoryTotal: state.skipHistoryTotal - 1,
        isLoading: false,
      }));
      showSuccessToast("Skip history deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete skip history";
      set({ error: errorMessage, isLoading: false });
      showErrorToast(errorMessage);
    }
  },

  addSongToFavorites: async (userId: string, trackId: string) => {
    // set({ isLoading: true, error: null });

    // Kiểm tra xem bài hát đã có trong danh sách yêu thích chưa
    set((state) => {
      const isAlreadyFavorited = state.favorites.some(
        (fav) => fav._id === trackId
      );
      if (isAlreadyFavorited) {
        showErrorToast("Song is already in favorites");
        return { ...state, isLoading: false }; // Trả về state hiện tại và tắt loading
      }
      return state; // Trả về state không thay đổi nếu không có lỗi
    });

    set((state) => {
      const songToAdd = state.songs.find((song: Song) => song._id === trackId);
      if (songToAdd) {
        return {
          ...state,
          favorites: [...state.favorites, songToAdd],
        };
      }
      return state; // Không thay đổi nếu không tìm thấy bài hát
    });

    try {
      const response = await axiosInstance.post("/songs/favorites/add", {
        userId,
        trackId,
      });
      // Cập nhật lại danh sách yêu thích với dữ liệu từ server (nếu cần)
      set((state) => ({
        favorites: state.favorites.map((fav) =>
          fav._id === trackId ? response.data.favorite.track : fav
        ),
      }));
      showSuccessToast("Song added to favorites");
    } catch (error: any) {
      // Quay lại trạng thái cũ nếu API thất bại
      set((state) => ({
        favorites: state.favorites.filter((fav) => fav._id !== trackId),
      }));
      console.error("Error in addSongToFavorites:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to add song to favorites"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  removeSongFromFavorites: async (userId: string, trackId: string) => {
    // set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/songs/favorites/remove", { userId, trackId });
      set((state) => ({
        favorites: state.favorites.filter((song) => song._id !== trackId),
      }));
      showSuccessToast("Song removed from favorites");
    } catch (error: any) {
      console.error("Error in removeSongFromFavorites:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to remove song from favorites"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserFavorites: async (userId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/favorites/${userId}?page=${page}&limit=${limit}`
      );
      set({
        favorites: response.data.songs,
      });
    } catch (error: any) {
      console.error("Error in fetchUserFavorites:", error);
      // showErrorToast(
      //   error.response?.data?.message || "Failed to fetch favorites"
      // );
    } finally {
      set({ isLoading: false });
    }
  },
  updateSong: async (id, songData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `/admin/update/songs/${id}`,
        songData
      );
      set((state) => ({
        songs: state.songs.map((s) => (s._id === id ? response.data : s)),
        currentSong:
          state.currentSong?._id === id ? response.data : state.currentSong,
      }));
      showSuccessToast("Song updated successfully");
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to update song");
    } finally {
      set({ isLoading: false });
    }
  },

  addPlaylist: async (newPlaylistData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        "/songs/playlists",
        newPlaylistData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const createdPlaylist: Playlist = response.data; // Ép kiểu để khớp interface
      set((state) => ({
        playlists: [...state.playlists, createdPlaylist],
      }));
      showSuccessToast("Playlist added successfully");
      return createdPlaylist;
    } catch (error: any) {
      console.error("Error in addPlaylist:", error);
      showErrorToast(
        `Failed to add playlist: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error; // Ném lỗi để xử lý ở nơi gọi hàm nếu cần
    } finally {
      set({ isLoading: false });
    }
  },

  deleteArtist: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/artists/${id}`);

      set((state) => ({
        artists: state.artists.filter((artist) => artist._id !== id),
      }));
      showSuccessToast("Song deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteSong", error);
      showErrorToast(error.response?.data?.message || "Error in deleteSong");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArtistById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/artists/${id}`);
      set({ currentArtist: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/songs/${id}`);
      const songData = response.data;
      // Lấy review của bài hát này (tùy chọn)
      const reviewResponse = await axiosInstance.get(
        `/search/reviews/song/${id}?limit=10`
      );
      set({
        currentSong: songData,
        reviews: reviewResponse.data.reviews,
        totalReviews: reviewResponse.data.total,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Error fetching song:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch song",
        isLoading: false,
      });
      showErrorToast(error.response?.data?.message || "Failed to fetch song");
    }
  },

  fetchAlbums: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `/albums?page=${page}&limit=${limit}`
      );
      set({
        albums: response.data.albums,
        currentAlbumPage: response.data.page,
        totalAlbumPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || 0) / limit),
      });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrackArtist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/trackartist");
      set({ trackartists: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrackGenre: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/trackgenre");
      set({ trackgenres: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrackInstrument: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/trackinstrument");
      set({ trackinstruments: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumTracks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/albumtrack");
      set({ albumtracks: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/albums/${id}`);
      // Map the backend response to match the Album interface if needed
      const albumData: Album = {
        ...response.data,
        artist: response.data.artist || {
          _id: "",
          name: "Unknown",
          imageUrl: "",
        }, // Fallback
        tracks: response.data.tracks || [],
        genres: response.data.genres || [],
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
        isFeatured: response.data.isFeatured || false,
        likes: response.data.likes || 0,
        streams: response.data.streams || 0,
      };
      set({ currentAlbum: albumData });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch album" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecentSongs: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/recent-song?page=${page}&limit=${limit}`
      );
      set({ recentSongs: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Trong useMusicStore.ts
  fetchFeaturedSongs: async () => {
    const { featuredSongs } = get();
    if (featuredSongs.length > 0) return; // Sử dụng cache nếu đã có dữ liệu

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/featured");
      set({ featuredSongs: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMadeForYouSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/made-for-you");
      set({ madeForYouSongs: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrendingSongs: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/trending?page=${page}&limit=${limit}`
      );
      set({ trendingSongs: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRandomSongs: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/songs/radom?limit=${limit}`);
      set({ randomSongs: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongByInstruments: async (id, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/instruments/${id}/song-by-instrument?page=${page}&limit=${limit}`
      );
      set({ songByInstruments: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongByGenres: async (id, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/${id}/song-by-genre?page=${page}&limit=${limit}`
      );
      set({ songByGenres: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongByArtist: async (id, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/${id}/song-by-artist?page=${page}&limit=${limit}`
      );
      set({ songsByArtists: response.data.songs });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongs: async (page = 1, limit = 20) => {
    const { songsCache } = get();
    if (songsCache[page]) {
      // Nếu dữ liệu đã có trong cache, sử dụng nó
      set({
        songs: songsCache[page],
        currentPage: page,
        songsPerPage: limit,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs?page=${page}&limit=${limit}`
      );
      // console.log("Fetched songs:", response.data);
      set({
        songs: response.data.songs,
        songsCache: { ...songsCache, [page]: response.data.songs }, // Lưu vào cache
        totalSongs: response.data.total,
        currentPage: response.data.page,
        songsPerPage: response.data.limit,
        totalPages: response.data.totalPages,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch songs" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlaylists: async (page = 1, limit = 6) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/songs/playlists/all/?page=${page}&limit=${limit}`
      );
      set({
        playlists: response.data.playlists || [],
        totalPlaylists: response.data.total || 0, // Đổi từ totalSongs thành totalPlaylists
        currentPlaylistPage: page,
        songsPerPlaylistPage: limit,
        totalPlaylistPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || 0) / limit),
      });
    } catch (error: any) {
      console.error("Error in fetchPlaylists:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch playlists",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArtists: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/artists?page=${page}&limit=${limit}`
      );
      set({
        artists: response.data.artists,
        currentArtistPage: response.data.page,
        totalArtistPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || 0) / limit),
      });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGenres: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/genres");
      set({ genres: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInstruments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/instruments");
      set({ instruments: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/stats");
      set({ stats: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSong: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/songs/${id}`);

      set((state) => ({
        songs: state.songs.filter((song) => song._id !== id),
      }));
      showSuccessToast("Song deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteSong", error);
      showErrorToast("Error deleting song");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAlbum: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/albums/${id}`);
      set((state) => ({
        albums: state.albums.filter((album) => album._id !== id),
        songs: state.songs.map((song) =>
          song.album?._id === id ? { ...song, album: undefined } : song
        ),
        albumtracks: state.albumtracks.filter((at) => at.album_id._id !== id), // Fixed comparison
        currentAlbum:
          state.currentAlbum?._id === id ? null : state.currentAlbum,
      }));
      showSuccessToast("Album deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete album";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  addSong: async (newSongData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/admin/songs", newSongData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdSong = response.data;

      set((state) => ({
        songs: [...state.songs, createdSong],
      }));
      showSuccessToast("Song added successfully");
    } catch (error: any) {
      console.log("Error in addSong", error);
      showErrorToast(`Failed to add song ${error.message}`);
    } finally {
      set({ isLoading: false });
    }
  },

  addArtist: async (newArtistData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        "/admin/artists",
        newArtistData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const createdArtist = response.data;
      set((state) => ({
        artists: [...state.artists, createdArtist],
      }));
      showSuccessToast("Artist added successfully");
      return createdArtist; // TypeScript now knows this is an Artist
    } catch (error: any) {
      console.log("Error in addArtist", error);
      showErrorToast(`Failed to add Artist: ${error.message}`);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addGenre: async (newGenreData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/admin/genres", newGenreData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdGenre = response.data;

      set((state) => ({
        genres: [...state.genres, createdGenre],
      }));
      showSuccessToast("Genre added successfully");
    } catch (error: any) {
      console.log("Error in addArtist", error);
      showErrorToast("Failed to add Artist");
    } finally {
      set({ isLoading: false });
    }
  },

  addInstrument: async (newInstrumentData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        "/admin/instruments",
        newInstrumentData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const createdInstrument = response.data;

      set((state) => ({
        instruments: [...state.instruments, createdInstrument],
      }));
      showSuccessToast("Instrument added successfully");
    } catch (error: any) {
      console.log("Error in addInstrument", error);
      showErrorToast("Error adding Instrument");
    } finally {
      set({ isLoading: false });
    }
  },

  addAlbum: async (newAlbumData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/admin/albums", newAlbumData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const createdAlbum = response.data;
      set((state) => ({
        albums: [...state.albums, createdAlbum],
      }));
      showSuccessToast("Album added successfully");
      return createdAlbum;
    } catch (error: any) {
      console.log("Error in addAlbum", error);
      showErrorToast(`Failed to add album: ${error.message}`);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
