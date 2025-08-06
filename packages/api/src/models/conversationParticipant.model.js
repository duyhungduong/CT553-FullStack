import mongoose from "mongoose";

const conversationParticipantSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true, // Tăng tốc truy vấn theo hội thoại
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Tăng tốc truy vấn theo user
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
    left_at: {
      type: Date,
      default: null, // Lưu thời gian rời nhóm (nếu có)
    },
    is_muted: {
      type: Boolean,
      default: false,
    },
    last_read_at: {
      type: Date,
      default: null, // Theo dõi tin nhắn đã đọc cuối cùng
    },
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Người mời vào nhóm
    },
  },
  { 
    timestamps: true,
    indexes: [{ key: { conversation: 1, user: 1 }, unique: true }] // Đảm bảo không trùng lặp
  }
);

export const ConversationParticipant = mongoose.model(
  "ConversationParticipant",
  conversationParticipantSchema
);
