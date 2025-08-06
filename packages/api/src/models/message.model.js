import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true }, // Clerk user ID
		receiverId: { type: String, required: true }, // Clerk user ID
    content: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    forwarded_from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    sent_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    delivered_at: {
      type: Date,
      default: null,
    },
    read_at: {
      type: Date,
      default: null,
    },
    edited_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);