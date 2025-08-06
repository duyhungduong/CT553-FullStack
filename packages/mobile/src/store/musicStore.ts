import { create } from 'zustand';

// Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artwork?: string;
  url: string;
  isLiked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  artwork?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicState {
  // Current Playing
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Queue Management
  queue: Song[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  
  // Library
  songs: Song[];
  playlists: Playlist[];
  likedSongs: Song[];
  recentlyPlayed: Song[];
  
  // Player Actions
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  
  // Queue Actions
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shuffleQueue: () => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  
  // Library Actions
  addSong: (song: Song) => void;
  removeSong: (songId: string) => void;
  toggleLikeSong: (songId: string) => void;
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  
  // History
  addToRecentlyPlayed: (song: Song) => void;
  
  // Update State
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSongs: (songs: Song[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  // Initial State
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 75,
  
  queue: [],
  currentIndex: 0,
  isShuffled: false,
  repeatMode: 'off',
  
  songs: [],
  playlists: [],
  likedSongs: [],
  recentlyPlayed: [],
  
  // Player Actions
  playSong: (song: Song) => {
    const currentState = get();
    set({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
    });
    
    // Add to recently played
    get().addToRecentlyPlayed(song);
    
    // Update queue if song not in current queue
    if (!currentState.queue.find(s => s.id === song.id)) {
      set(state => ({
        queue: [...state.queue, song],
        currentIndex: state.queue.length,
      }));
    } else {
      const index = currentState.queue.findIndex(s => s.id === song.id);
      set({ currentIndex: index });
    }
  },
  
  pauseSong: () => set({ isPlaying: false }),
  
  resumeSong: () => set({ isPlaying: true }),
  
  nextSong: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else if (repeatMode === 'one') {
        nextIndex = currentIndex;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    
    const nextSong = queue[nextIndex];
    if (nextSong) {
      set({
        currentSong: nextSong,
        currentIndex: nextIndex,
        currentTime: 0,
        isPlaying: true,
      });
      get().addToRecentlyPlayed(nextSong);
    }
  },
  
  previousSong: () => {
    const { queue, currentIndex, currentTime } = get();
    if (queue.length === 0) return;
    
    // If more than 3 seconds played, restart current song
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    
    const prevSong = queue[prevIndex];
    if (prevSong) {
      set({
        currentSong: prevSong,
        currentIndex: prevIndex,
        currentTime: 0,
        isPlaying: true,
      });
      get().addToRecentlyPlayed(prevSong);
    }
  },
  
  seekTo: (time: number) => set({ currentTime: time }),
  
  setVolume: (volume: number) => set({ volume }),
  
  // Queue Actions
  addToQueue: (song: Song) => {
    set(state => ({
      queue: [...state.queue, song],
    }));
  },
  
  removeFromQueue: (index: number) => {
    set(state => ({
      queue: state.queue.filter((_, i) => i !== index),
      currentIndex: state.currentIndex > index ? state.currentIndex - 1 : state.currentIndex,
    }));
  },
  
  clearQueue: () => set({
    queue: [],
    currentIndex: 0,
    currentSong: null,
    isPlaying: false,
  }),
  
  shuffleQueue: () => {
    const { queue, currentSong } = get();
    if (queue.length <= 1) return;
    
    // Keep current song at index 0, shuffle the rest
    const otherSongs = queue.filter(song => song.id !== currentSong?.id);
    const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
    
    const newQueue = currentSong ? [currentSong, ...shuffled] : shuffled;
    
    set({
      queue: newQueue,
      currentIndex: 0,
      isShuffled: !get().isShuffled,
    });
  },
  
  setRepeatMode: (mode: 'off' | 'all' | 'one') => set({ repeatMode: mode }),
  
  // Library Actions
  addSong: (song: Song) => {
    set(state => ({
      songs: [...state.songs, song],
    }));
  },
  
  removeSong: (songId: string) => {
    set(state => ({
      songs: state.songs.filter(song => song.id !== songId),
      likedSongs: state.likedSongs.filter(song => song.id !== songId),
      recentlyPlayed: state.recentlyPlayed.filter(song => song.id !== songId),
      queue: state.queue.filter(song => song.id !== songId),
    }));
  },
  
  toggleLikeSong: (songId: string) => {
    const { songs, likedSongs } = get();
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    const isLiked = likedSongs.some(s => s.id === songId);
    
    if (isLiked) {
      set(state => ({
        likedSongs: state.likedSongs.filter(s => s.id !== songId),
        songs: state.songs.map(s => 
          s.id === songId ? { ...s, isLiked: false } : s
        ),
      }));
    } else {
      set(state => ({
        likedSongs: [...state.likedSongs, { ...song, isLiked: true }],
        songs: state.songs.map(s => 
          s.id === songId ? { ...s, isLiked: true } : s
        ),
      }));
    }
  },
  
  createPlaylist: (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set(state => ({
      playlists: [...state.playlists, newPlaylist],
    }));
  },
  
  addToPlaylist: (playlistId: string, song: Song) => {
    set(state => ({
      playlists: state.playlists.map(playlist => 
        playlist.id === playlistId
          ? { 
              ...playlist, 
              songs: [...playlist.songs, song],
              updatedAt: new Date().toISOString(),
            }
          : playlist
      ),
    }));
  },
  
  removeFromPlaylist: (playlistId: string, songId: string) => {
    set(state => ({
      playlists: state.playlists.map(playlist => 
        playlist.id === playlistId
          ? { 
              ...playlist, 
              songs: playlist.songs.filter(s => s.id !== songId),
              updatedAt: new Date().toISOString(),
            }
          : playlist
      ),
    }));
  },
  
  // History
  addToRecentlyPlayed: (song: Song) => {
    set(state => {
      const filtered = state.recentlyPlayed.filter(s => s.id !== song.id);
      return {
        recentlyPlayed: [song, ...filtered].slice(0, 50), // Keep only 50 recent
      };
    });
  },
  
  // Update State
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setSongs: (songs: Song[]) => set({ songs }),
  setPlaylists: (playlists: Playlist[]) => set({ playlists }),
}));
