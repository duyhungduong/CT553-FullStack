import { Server } from "socket.io";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ConversationParticipant } from "../models/conversationParticipant.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  const userSockets = new Map(); // { clerkId: socketId }
  const userActivities = new Map(); // { clerkId: activity }

  io.on("connection", (socket) => {
    // Khi user kết nối
    socket.on("user_connected", (clerkId) => {
      userSockets.set(clerkId, socket.id);
      userActivities.set(clerkId, "Idle");
      // console.log(`User ${clerkId} connected with socket ID: ${socket.id}`);

      io.emit("user_connected", clerkId);
      socket.emit("users_online", Array.from(userSockets.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    });

    socket.on("update_activity", ({ clerkId, activity }) => {
      // console.log("activity updated", userId, activity);
      userActivities.set(clerkId, activity);
      io.emit("activity_updated", { clerkId, activity });
    });

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      // console.log(`User joined conversation: ${conversationId}`);
    });

    // Gửi tin nhắn (chỉ phát lại, không tạo mới)
    socket.on("send_message", async (data) => {
      const {
        conversationId,
        senderId,
        receiverId,
        content,
        imageUrl,
        reply_to,
        sent_at,
        _id, // Nhận _id từ frontend
      } = data;

      try {
        const sender = await User.findOne({ clerkId: senderId });
        const receiver = await User.findOne({ clerkId: receiverId });

        if (!sender || !receiver) {
          socket.emit("message_error", "Sender or receiver not found");
          return;
        }

        const participant = await ConversationParticipant.findOne({
          conversation: conversationId,
          user: sender._id,
        });

        if (!participant) {
          socket.emit("message_error", "Sender not part of this conversation");
          return;
        }

        const message = {
          _id, // Sử dụng _id từ frontend
          conversationId,
          senderId,
          receiverId,
          content: content || null,
          imageUrl: imageUrl || null,
          reply_to: reply_to || null,
          sent_at: sent_at || new Date(),
        };

        io.to(conversationId).emit("receive_message", message);
        socket.emit("message_sent", message);

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId && !socket.rooms.has(conversationId)) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.error("Message error:", error);
        socket.emit(
          "message_error",
          error.message || "Failed to process message"
        );
      }
    });

    // Đánh dấu tin nhắn đã đọc
    socket.on("mark_message_read", async ({ messageId, clerkId }) => {
      try {
        const user = await User.findOne({ clerkId });
        if (!user) {
          return socket.emit("message_error", "User not found");
        }

        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit("message_error", "Message not found");
        }

        const participant = await ConversationParticipant.findOne({
          conversation: message.conversationId,
          user: user._id,
        });
        if (!participant) {
          return socket.emit(
            "message_error",
            "You are not part of this conversation"
          );
        }

        message.is_read = true;
        message.read_at = new Date();
        await message.save();

        participant.last_read_at = new Date();
        await participant.save();

        const senderSocketId = userSockets.get(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_read", {
            messageId,
            read_at: message.read_at,
          });
        }
      } catch (error) {
        console.error("Mark message read error:", error);
        socket.emit(
          "message_error",
          error.message || "Failed to mark message as read"
        );
      }
    });

    // Xóa tin nhắn
    socket.on("delete_message", async ({ messageId, clerkId }) => {
      try {
        const user = await User.findOne({ clerkId });
        if (!user) {
          return socket.emit("message_error", "User not found");
        }

        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit("message_error", "Message not found");
        }

        if (message.senderId !== clerkId) {
          return socket.emit(
            "message_error",
            "You don't have permission to delete this message"
          );
        }

        message.is_deleted = true;
        await message.save();

        const receiverSocketId = userSockets.get(message.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message_deleted", { messageId });
        }
        socket.emit("message_deleted", { messageId });
      } catch (error) {
        console.error("Delete message error:", error);
        socket.emit(
          "message_error",
          error.message || "Failed to delete message"
        );
      }
    });

    socket.on("typing", ({ clerkId, conversationId }) => {
      io.emit("typing", { clerkId, conversationId });
    });

    socket.on("stop_typing", ({ clerkId, conversationId }) => {
      io.emit("stop_typing", { clerkId, conversationId });
    });

    // Khi user ngắt kết nối
    socket.on("disconnect", () => {
      let disconnectedClerkId;
      for (const [clerkId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedClerkId = clerkId;
          userSockets.delete(clerkId);
          userActivities.delete(clerkId);
          break;
        }
      }
      if (disconnectedClerkId) {
        io.emit("user_disconnected", disconnectedClerkId);
      }
      // console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
