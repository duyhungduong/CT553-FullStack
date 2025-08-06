import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
      index: true, // Tăng tốc truy vấn theo loại hội thoại
    },
    title: {
      type: String,
      required: function () {
        return this.type === "group";
      },
      trim: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }], // Thêm danh sách tham chiếu người dùng để kiểm tra nhanh
    last_message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    }, // Lưu tin nhắn cuối cùng để hiển thị preview
    is_active: {
      type: Boolean,
      default: true,
      index: true, // Tăng tốc lọc các hội thoại active
    },
    is_pinned: {
      type: Boolean,
      default: false, // Cho phép người dùng ghim hội thoại
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "group";
      }, // Người tạo nhóm
    },
    settings: {
      is_encrypted: { type: Boolean, default: false }, // Hỗ trợ mã hóa end-to-end
      notifications: { type: Boolean, default: true }, // Tắt thông báo nếu cần
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);