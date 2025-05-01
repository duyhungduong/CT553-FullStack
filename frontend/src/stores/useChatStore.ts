import { axiosInstance } from "@/lib/axios";
import {
  Message,
  User,
  Conversation,
  GetMessagesResponse,
  SendMessageResponse,
  DeleteMessageResponse,
  MarkMessageAsReadResponse,
} from "@/types";
import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface ChatStore {
  users: User[];
  info: User | null;
  clerkId: string
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Record<string, Message[]>; // Tin nhắn theo conversationId
  conversations: Conversation[];
  selectedUser: User | null;
  conversationId: string | null;
  unreadCount: number;
  friends: User[];
  pendingRequests: {
    _id: string;
    user_id1: User;
    user_id2: User;
    status: string;
  }[];
  typingUsers: Map<string, string>;

  fetchInfo: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  initSocket: (clerkId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (messageData: {
    conversationId: string;
    content?: string;
    image?: File;
    reply_to?: string;
  }) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchConversation: (otherClerkId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  joinConversation: (conversationId: string) => void;
  markMessageAsRead: (
    messageId: string,
    conversationId: string
  ) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  fetchLastMessage: (conversationId: string) => Promise<void>;
  editMessage: (
    messageId: string,
    content: string,
    conversationId: string
  ) => Promise<void>;
  createConversation: (otherClerkId: string) => Promise<void>;
  clearError: () => void;
  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  sendFriendRequest: (friendClerkId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  declineFriendRequest: (friendshipId: string) => Promise<void>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;

  getMongoUserId: (clerkId: string) => Promise<string>;

  sendSticker: (data: { conversationId: string; stickerId: string }) => Promise<void>;
  sendGif: (data: { conversationId: string; gifUrl: string }) => Promise<void>;
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

const baseURL = "http://localhost:5000"; // Socket dùng base URL không có /api
const socket = io(baseURL, {
  autoConnect: false, // only connect if user is authenticated
  withCredentials: true,
});
const userIdCache = new Map<string, string>();
export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  info: null,
  clerkId: "",
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: {},
  conversations: [],
  selectedUser: null,
  conversationId: null,
  unreadCount: 0,
  friends: [],
  pendingRequests: [],
  typingUsers: new Map(),


  sendGif: async ({ conversationId, gifUrl }: { conversationId: string; gifUrl: string }) => {
    set({ isLoading: true, error: null });
    try {
      const senderClerkId = get().info?.clerkId;
      const receiverClerkId = get().selectedUser?.clerkId;

      // Kiểm tra xác thực và thông tin cần thiết
      if (!senderClerkId) throw new Error("User not authenticated");
      if (!conversationId) throw new Error("Conversation ID is required");
      if (!receiverClerkId) throw new Error("Receiver not selected");
      if (!gifUrl) throw new Error("GIF URL is required");

      // Gửi yêu cầu đến API sendGif
      const response = await axiosInstance.post<SendMessageResponse>(
        `/users/conversations/${conversationId}/gif`,
        { gifUrl, receiverId: receiverClerkId },
        { headers: { "Content-Type": "application/json" } }
      );

      // Lấy tin nhắn mới từ response
      const newMessage = response.data.data;

      // Cập nhật state messages và conversations
      set((state) => {
        const updatedMessages = {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            newMessage,
          ].filter(
            (msg, index, self) =>
              self.findIndex((m) => m._id === msg._id) === index
          ),
        };

        const updatedConversations = state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, last_message: newMessage }
            : conv
        );

        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });

      // Phát sự kiện qua socket
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit("send_message", {
          conversationId,
          senderId: senderClerkId,
          receiverId: receiverClerkId,
          content: null, // Không có nội dung văn bản
          imageUrl: newMessage.imageUrl, // imageUrl từ GIF
          sent_at: newMessage.sent_at,
          _id: newMessage._id,
        });
      }

      // Hiển thị toast thành công
      showSuccessToast("GIF sent successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send GIF";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  sendSticker: async ({ conversationId, stickerId }: { conversationId: string; stickerId: string }) => {
    set({ isLoading: true, error: null });
    try {
      const senderClerkId = get().info?.clerkId;
      const receiverClerkId = get().selectedUser?.clerkId;
  
      // Kiểm tra xác thực và thông tin cần thiết
      if (!senderClerkId) throw new Error("User not authenticated");
      if (!conversationId) throw new Error("Conversation ID is required");
      if (!receiverClerkId) throw new Error("Receiver not selected");
      if (!stickerId) throw new Error("Sticker ID is required");
  
      // Gửi yêu cầu đến API sendSticker
      const response = await axiosInstance.post<SendMessageResponse>(
        `/users/conversations/${conversationId}/sticker`,
        { stickerId, receiverId: receiverClerkId },
        { headers: { "Content-Type": "application/json" } }
      );

      const newMessage = response.data.data;
  
      set((state) => {
        // Cập nhật messages
        const updatedMessages = {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            newMessage,
          ].filter(
            (msg, index, self) =>
              self.findIndex((m) => m._id === msg._id) === index
          ),
        };

        // Cập nhật conversations với last_message
        const updatedConversations = state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, last_message: newMessage }
            : conv
        );

        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });
      
  
      // Phát sự kiện qua socket
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit("send_message", {
          conversationId,
          senderId: senderClerkId,
          receiverId: receiverClerkId,
          content: null, // Không có nội dung văn bản
          imageUrl: newMessage.imageUrl, // imageUrl từ sticker
          sent_at: newMessage.sent_at,
          _id: newMessage._id,
        });
      }
  
      // Hiển thị toast thành công
      showSuccessToast("Sticker sent successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send sticker";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

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

  fetchLastMessage: async (conversationId: string) => {
    // set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get<{ last_message: Message | null }>(
        `/users/conversations/${conversationId}/last-message`
      );
      const lastMessage = response.data.last_message;
  
      if (lastMessage) {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv._id === conversationId
              ? { ...conv, last_message: lastMessage }
              : conv
          ),
        }));
      }
  
      // showSuccessToast("Last message fetched successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch last message";
      set({ error: errorMessage });
      // showErrorToast(errorMessage);
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

  clearError: () => set({ error: null }),

  startTyping: (conversationId: string) => {
    // Thêm lại conversationId
    const socket = get().socket;
    const clerkId = get().info?.clerkId;
    if (socket && clerkId) {
      socket.emit("typing", { clerkId, conversationId }); // Gửi cả clerkId và conversationId
    }
  },

  stopTyping: (conversationId: string) => {
    // Thêm lại conversationId
    const socket = get().socket;
    const clerkId = get().info?.clerkId;
    if (socket && clerkId) {
      socket.emit("stop_typing", { clerkId, conversationId }); // Gửi cả clerkId và conversationId
    }
  },

  createConversation: async (otherClerkId: string) => {
    set({ isLoading: true, error: null });
    try {
      const otherUserId = await get().getMongoUserId(otherClerkId);
      const response = await axiosInstance.post<{ conversation: Conversation }>(
        "/users/conversations/create",
        { type: "private", participants: [otherUserId] }
      );
      const convId = response.data.conversation._id;

      set({ conversationId: convId });
      get().joinConversation(convId);
      await get().fetchMessages(convId);
      await get().fetchConversations();
      showSuccessToast("Conversation created successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create conversation";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user, conversationId: null, messages: {} });
    if (user) {
      get().fetchConversation(user.clerkId);
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users/except-me");
      set({ users: response.data, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";
      set({ error: errorMessage });
      // showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users/info");
      set({ info: response.data, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user info";
      set({ error: errorMessage });
      // showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversation: async (otherClerkId: string) => {
    set({ isLoading: true, error: null });
    try {
      const currentUserClerkId = get().info?.clerkId;
      if (!currentUserClerkId) throw new Error("Current user not found");
  
      const currentUserResponse = await axiosInstance.get<User>(
        `/users/clerk/${currentUserClerkId}`
      );
      const otherUserResponse = await axiosInstance.get<User>(
        `/users/clerk/${otherClerkId}`
      );
      const currentUserId = currentUserResponse.data._id;
      const otherUserId = otherUserResponse.data._id;
  
      const response = await axiosInstance.get<{
        conversations: Conversation[];
      }>("/users/conversations");
      const conversations = response.data.conversations || [];
  
      const existingConversation = conversations.find((conv) => {
        if (conv.type !== "private" || conv.participants.length !== 2) return false;
  
        if (Array.isArray(conv.participants)) {
          if (typeof conv.participants[0] === "string") {
            // participants là string[]
            return (
              (conv.participants as string[]).includes(currentUserId) &&
              (conv.participants as string[]).includes(otherUserId)
            );
          } else {
            // participants là User[]
            return (
              (conv.participants as User[]).some((p) => p._id === currentUserId) &&
              (conv.participants as User[]).some((p) => p._id === otherUserId)
            );
          }
        }
        return false;
      });
  
      let convId: string;
      if (existingConversation) {
        convId = existingConversation._id;
      } else {
        const createResponse = await axiosInstance.post<{
          conversation: Conversation;
        }>("/users/conversations/create", {
          type: "private",
          participantIds: [otherUserId],
        });
        convId = createResponse.data.conversation._id;
      }
  
      set({ conversationId: convId });
      get().joinConversation(convId);
      await get().fetchMessages(convId);
      await get().fetchConversations();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch conversation";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get<{
        conversations: Conversation[];
      }>("/users/conversations");
      console.log("Raw API response:", response.data);
      set({ conversations: response.data.conversations, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch conversations";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },


  joinConversation: (conversationId: string) => {
    const socket = get().socket;
    if (
      socket &&
      get().isConnected &&
      get().conversationId !== conversationId
    ) {
      socket.emit("join_conversation", conversationId);
      set({ conversationId });
    }
  },

  sendMessage: async (messageData: {
    conversationId: string;
    content?: string;
    image?: File;
    reply_to?: string;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const { conversationId, content, image, reply_to } = messageData;
      const senderClerkId = get().info?.clerkId;
      const receiverClerkId = get().selectedUser?.clerkId;
      if (!senderClerkId) throw new Error("User not authenticated");
      if (!conversationId) throw new Error("Conversation ID is required");
      if (!receiverClerkId) throw new Error("Receiver not selected");

      let response;
      if (image) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("receiverId", receiverClerkId);
        if (content) formData.append("content", content);
        formData.append("image", image);
        if (reply_to) formData.append("reply_to", reply_to);

        response = await axiosInstance.post<SendMessageResponse>(
          `/users/conversations/${conversationId}/messages`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        const jsonData = {
          conversationId,
          receiverId: receiverClerkId,
          content,
          reply_to,
        };

        response = await axiosInstance.post<SendMessageResponse>(
          `/users/conversations/${conversationId}/messages`,
          jsonData,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const newMessage = response.data.data;
      // set((state) => ({
      //   messages: {
      //     ...state.messages,
      //     [conversationId]: [
      //       ...(state.messages[conversationId] || []),
      //       newMessage,
      //     ].filter(
      //       (msg, index, self) =>
      //         self.findIndex((m) => m._id === msg._id) === index
      //     ),
      //   },
      // }));

      set((state) => {
        // Cập nhật messages
        const updatedMessages = {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            newMessage,
          ].filter(
            (msg, index, self) =>
              self.findIndex((m) => m._id === msg._id) === index
          ),
        };

        // Cập nhật conversations với last_message
        const updatedConversations = state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, last_message: newMessage }
            : conv
        );

        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });

      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit("send_message", {
          conversationId,
          senderId: senderClerkId,
          receiverId: receiverClerkId,
          content,
          imageUrl: newMessage.imageUrl,
          reply_to,
          sent_at: newMessage.sent_at,
          _id: newMessage._id, // Thêm _id để đồng bộ
        });
      }

      showSuccessToast("Message sent successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send message";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get<GetMessagesResponse>(
        `/users/conversations/${conversationId}/messages/:id`
      );
      set({
        messages: {
          ...get().messages,
          [conversationId]: response.data.messages.sort(
            (a, b) =>
              new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
          ),
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch messages";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  markMessageAsRead: async (messageId: string, conversationId: string) => {
    try {
      const response = await axiosInstance.put<MarkMessageAsReadResponse>(
        `/users/conversations/${conversationId}/messages/${messageId}/read`
      );
      const socket = get().socket;
      if (socket)
        socket.emit("mark_message_read", { messageId, conversationId });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg._id === messageId
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          ),
        },
      }));
      showSuccessToast("Message marked as read");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark message as read";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    }
  },

  deleteMessage: async (messageId: string, conversationId: string) => {
    try {
      const response = await axiosInstance.delete<DeleteMessageResponse>(
        `/users/conversations/${conversationId}/messages/${messageId}`
      );
      const socket = get().socket;
      if (socket) socket.emit("delete_message", { messageId, conversationId });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].filter(
            (msg) => msg._id !== messageId
          ),
        },
      }));
      showSuccessToast("Message deleted successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete message";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    }
  },

  editMessage: async (
    messageId: string,
    content: string,
    conversationId: string
  ) => {
    try {
      const response = await axiosInstance.patch<Message>(
        `/messages/${messageId}`,
        { content }
      );
      const socket = get().socket;
      if (socket)
        socket.emit("edit_message", { messageId, content, conversationId });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg._id === messageId
              ? { ...msg, content, edited_at: new Date().toISOString() }
              : msg
          ),
        },
      }));
      showSuccessToast("Message edited successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to edit message";
      set({ error: errorMessage });
      showErrorToast(errorMessage);
    }
  },

  initSocket: (clerkId: string) => {
    if (!get().isConnected) {
      const socket = io(baseURL, {
        auth: { clerkId },
        autoConnect: false,
        withCredentials: true,
      });
      socket.auth = { userId: clerkId };
      socket.connect();
      set({ socket });
      set({ clerkId });

      socket.on("connect", () => {
        set({ isConnected: true });
        socket.emit("user_connected", clerkId);
        // showSuccessToast("Connected to chat server");
      });

      socket.on("users_online", (users: string[]) =>
        set({ onlineUsers: new Set(users) })
      );
      socket.on("activities", (activities: [string, string][]) =>
        set({ userActivities: new Map(activities) })
      );
      socket.on("user_connected", (clerkId: string) =>
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, clerkId]),
        }))
      );
      socket.on("user_disconnected", (clerkId: string) =>
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(clerkId);
          return { onlineUsers: newOnlineUsers };
        })
      );

      socket.on("receive_message", (message: Message) =>
        set((state) => {
          const existingMessages = state.messages[message.conversationId] || [];
          const messageExists = existingMessages.some(
            (m) => m._id === message._id
          );
          if (!messageExists) {
            return {
              messages: {
                ...state.messages,
                [message.conversationId]: [...existingMessages, message].sort(
                  (a, b) =>
                    new Date(a.sent_at).getTime() -
                    new Date(b.sent_at).getTime()
                ),
              },
            };
          }
          return state; // Không thêm nếu tin nhắn đã tồn tại
        })
      );

      socket.on("message_deleted", ({ messageId }) =>
        set((state) => {
          const updatedMessages = { ...state.messages };
          for (const convId in updatedMessages) {
            updatedMessages[convId] = updatedMessages[convId].filter(
              (msg) => msg._id !== messageId
            );
          }
          return { messages: updatedMessages };
        })
      );

      socket.on("message_read", ({ messageId, read_at }) =>
        set((state) => {
          const updatedMessages = { ...state.messages };
          for (const convId in updatedMessages) {
            updatedMessages[convId] = updatedMessages[convId].map((msg) =>
              msg._id === messageId ? { ...msg, is_read: true, read_at } : msg
            );
          }
          return { messages: updatedMessages };
        })
      );

      socket.on("typing", ({ clerkId, conversationId }) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          newTypingUsers.set(clerkId, conversationId);
          return { typingUsers: newTypingUsers };
        })
      );

      socket.on("stop_typing", ({ clerkId, conversationId }) =>
        set((state) => {
          const newTypingUsers = new Map(state.typingUsers);
          if (newTypingUsers.get(clerkId) === conversationId) {
            newTypingUsers.delete(clerkId);
          }
          return { typingUsers: newTypingUsers };
        })
      );

      socket.on("activity_updated", ({ clerkId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(clerkId, activity);
					return { userActivities: newActivities };
				});
			});

      socket.on("message_error", (message: string) => {
        set({ error: message });
        // showErrorToast(message);
      });

      socket.on("connect_error", (error) => {
        set({ error: error.message, isConnected: false });
        // showErrorToast("Connection error: " + error.message);
      });

      // Ngắt kết nối khi component unmount
      return () => {
        socket.disconnect();
        set({ socket: null, isConnected: false });
      };
    }
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && get().isConnected) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        onlineUsers: new Set(),
        userActivities: new Map(),
      });
      // showSuccessToast("Disconnected from chat server");
    }
  },
}));
