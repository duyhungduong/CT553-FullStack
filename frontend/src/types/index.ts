export interface Song {
  _id: string;
  title: string;
  releaseYear: number;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  likes: number;
  streams: number;
  isFeatured: boolean;
  mood?: string;
  tempo_bpm?: number;
  key_signature?: string;
  time_signature?: string;
  view_count: number;
  download_count: number;
  average_rating: number;
  createdAt: string;
  updatedAt: string;

  artists: { _id: string; name: string; imageUrl?: string }[];
  genres: { _id: string; name: string; imageUrl?: string }[];
  instruments: { _id: string; name: string; imageUrl?: string }[];
  album: { _id: string; title: string; imageUrl: string } | null | undefined;
}




export interface Album {
  _id: string;
  title: string;
  releaseYear: number;
  imageUrl: string;
  description: string;
  total_tracks: number;
  total_duration: number;
  isFeatured: boolean;
  likes: number;
  streams: number;
  createdAt: string;
  updatedAt: string;

  tracks?: Song[];
  artist: { _id: string; name: string; imageUrl?: string };
  genres: { _id: string; name: string; imageUrl?: string }[]; // Thêm genres vào Album
}

export interface Sticker {
  _id: string;
  name: string;
  image_url: string;
  category: string; // Thể loại sticker (bắt buộc ở backend)
  is_premium: boolean; // Trạng thái premium (mặc định false ở backend)
  packId?: string; // Tùy chọn, nếu bạn thêm logic ở API
  createdAt?: string;
  updatedAt?: string;
}

export interface StickerPack {
  _id: string;
  name: string;
  description?: string;
  is_premium?: boolean;
  price?: number;
  stickers: Sticker[] | null;
  createdAt?: string;
  updatedAt?: string;
  isOwned?: boolean;
}
// StickerPackItem: Liên kết giữa Sticker và StickerPack
export interface StickerPackItem {
  _id: string;
  pack: string | StickerPack; // ID hoặc object StickerPack
  sticker: string | Sticker; // ID hoặc object Sticker
  createdAt?: string;
  updatedAt?: string;
}

// UserStickerPack: Liên kết giữa User và StickerPack
export interface UserStickerPack {
  _id: string;
  user: User; // ID hoặc object User
  pack: StickerPack; // ID hoặc object StickerPack
  purchased_at: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface MessageFile {
  url: string;
  file_name: string;
  file_type: string; // Ví dụ: "image/png", "audio/mp3"
  size: number; // Kích thước file (bytes)
}

export interface Message {
  _id: string;
  conversationId: string; // ID của Conversation (chuỗi từ ObjectId)
  senderId: string; // Clerk ID của người gửi
  receiverId: string; // Clerk ID của người nhận
  content?: string; // Nội dung tin nhắn, có thể không có nếu chỉ gửi hình ảnh
  imageUrl?: string; // URL của hình ảnh nếu có
  reply_to?: {
    _id: string;
    content: string;
    senderId: string;
  } | null; // Tin nhắn được trả lời, populate từ Message
  forwarded_from?: string | null; // ID của tin nhắn được forward (chuỗi ObjectId)
  is_read: boolean;
  is_deleted: boolean;
  sent_at: string; // ISO date string
  delivered_at?: string | null; // ISO date string, có thể null
  read_at?: string | null; // ISO date string, có thể null
  edited_at?: string | null; // ISO date string, có thể null
  createdAt: string; // ISO date string từ timestamps
  updatedAt: string; // ISO date string từ timestamps
}

export interface ConversationParticipant {
  _id: string;
  conversation: string; // ID của Conversation
  user: string; // ID của User
  role: "admin" | "member";
  joined_at: string;
  left_at?: string; // Có thể null
  is_muted: boolean;
  last_read_at?: string; // Có thể null
  invited_by?: string; // ID của User, có thể null
  createdAt: string;
  updatedAt: string;
}
export interface Conversation {
  _id: string;
  type: "private" | "group";
  title?: string; // Chỉ có trong group
  participants: User[] | string[];
  last_message?: Message; // Populate từ Message, có thể null
  is_active: boolean;
  is_pinned: boolean;
  created_by?: string; // ID của User, chỉ có trong group
  settings: {
    is_encrypted: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
  last_read_at?: string; // Từ ConversationParticipant, có thể null
}

// API Responses
export interface CreateConversationResponse {
  success: boolean;
  conversation: Conversation;
  message: string;
}

export interface GetUserConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
  messageText: string;
  data: Message;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface DeleteMessageResponse {
  success: boolean;
  messageId: string;
  message: string;
}

export interface MarkMessageAsReadResponse {
  success: boolean;
  messageId: string;
  message: string;
}

export interface Stats {
  totalSongs: number;
  totalAlbums: number;
  totalUsers: number;
  totalArtists: number;
  totalGenres: number;
  totalInstruments: number;
}

export interface Playlist {
  _id: string;
  userId: string; // MongoDB ObjectId as a string
  title: string;
  description: string;
  isPublic: boolean;
  imageUrl?: string; // Optional since it's not required in the schema
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tracks?: Song[];
  total_tracks?: number;
  artist: { _id: string; name: string; imageUrl?: string };
  genres: { _id: string; name: string; imageUrl?: string }[];
  user: { _id: string; name: string; imageUrl?: string };
}

// User Interface
export interface User {
  _id: string; // MongoDB ObjectId
  clerkId: string;
  fullName: string;
  imageUrl: string;
  joined_date?: string; // ISO date string
  is_premium?: boolean;
  last_login?: string | null; // ISO date string or null
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}
export interface Review {
  _id: string; // MongoDB ObjectId
  user_id: User | string; // Có thể là full User object hoặc chỉ ID
  song_id: Song | string; // Có thể là full Song object hoặc chỉ ID
  rating: number; // Điểm đánh giá từ 0 đến 5
  comment?: string; // Bình luận, không bắt buộc
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface Artist {
  _id: string;
  name: string;
  bio: string;
  imageUrl?: string;
  country: string;
  website: string;
  joined_date: string;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
  songs?: {
    _id: string;
    title: string;
    imageUrl: string;
    duration: number;
  }[];
}

// Genre Interface
export interface Genre {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;

  songCount?: number;
}

// Instrument Interface
export interface Instrument {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  family: string;
  songCount?: number;
}

export interface TrackArtist {
  track_id: Song;
  artist_id: Artist;
  role: string;
}

export interface TrackInstrument {
  track_id: Song;
  instrument_id: Instrument;
  is_primary: boolean;
}

export interface AlbumTrack {
  album_id: Album;
  track_id: Song;
  track_number: number;
}

export interface TrackGenre {
  track_id: Song;
  genre_id: Genre;
}

export interface PlayHistory {
  _id: string;
  user_id: string; // MongoDB ObjectId as a string
  track_id: Song; // Reference to Song type
  played_at: string; // ISO date string
  play_duration: number;
  source: "queue" | "playlist" | "album" | "radio";
  source_id?: string; // Optional MongoDB ObjectId as a string
  completed: boolean;
  device_info?: string;
  ip_address?: string;
}

export interface SkipHistory {
  _id: string;
  user_id: string; // MongoDB ObjectId as a string
  track_id: Song; // Reference to Song type
  skipped_at: string; // ISO date string
  play_duration: number;
  skip_type: "manual" | "automatic";
  reason?: string;
}

export interface Queue {
  _id: string;
  user_id: string;
  name?: string;
  is_active: boolean;
  is_shuffle: boolean;
  repeat_mode: "none" | "one" | "all" | "off";
  current_track_index: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  _id: string;
  queue_id: string;
  track_id: string;
  position: number;
  source: "playlist" | "album" | "radio" | "search";
  source_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedQueue {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  tracks: {
    track_id: string;
    position: number;
    source: "playlist" | "album" | "radio" | "search";
    source_id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ListeningSession {
  _id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  total_duration: number;
  tracks_played: number;
  device_info: string;
  ip_address: string;
  status: "active" | "completed";
  createdAt: string;
  updatedAt: string;
}
