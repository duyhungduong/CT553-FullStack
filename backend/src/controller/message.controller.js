import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ConversationParticipant } from "../models/conversationParticipant.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Sticker } from "../models/sticker.model.js";

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      chunk_size: 20000000, // 10MB
      timeout: 180000, // 3 phút
    });
    if (!result || !result.secure_url) {
      throw new Error("Upload failed. No secure URL returned.");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary", error.message);
    throw new Error("Error uploading to Cloudinary: " + error.message);
  }
};

// Gửi tin nhắn
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, reply_to, receiverId } = req.body;
    const senderId = req.user?.clerkId;
    let imageUrl = null;

    // console.log("Received request:", req.body, req.files);

    if (!req.user || !req.user._id || !senderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    const conversation = await Conversation.findById(conversationId).populate(
      "participants"
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const receiverParticipant = conversation.participants.find(
      (p) => p.clerkId !== senderId
    );
    if (!receiverParticipant) {
      return res
        .status(400)
        .json({ message: "No receiver found in conversation" });
    }

    // Xử lý file upload với express-fileupload
    if (req.files && req.files.image) {
      const file = req.files.image; // File được gửi từ frontend trong trường "image"
      imageUrl = await uploadToCloudinary(file); // Upload lên Cloudinary
    }

    const messageData = {
      conversationId,
      senderId,
      receiverId: receiverId || receiverParticipant.clerkId,
      content: content || null,
      imageUrl,
      reply_to: reply_to || null,
      sent_at: new Date(),
    };

    const message = await Message.create(messageData);

    await Conversation.findByIdAndUpdate(conversationId, {
      last_message: message._id,
    });

    // Phát tin nhắn qua socket
    req.io.to(conversationId).emit("receive_message", message);

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
};
// Lấy tin nhắn trong một conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Kiểm tra user có trong conversation không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    const messages = await Message.find({
      conversationId,
      is_deleted: false,
    })
      .sort({ sent_at: 1 })
      .populate("reply_to", "content senderId")
      .lean();

    res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    next(error);
  }
};

// Xóa tin nhắn
export const deleteMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;

    // Kiểm tra user có trong conversation không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    const message = await Message.findOne({
      _id: messageId,
      conversationId,
      senderId: req.user.clerkId,
    });

    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found or you don't have permission" });
    }

    message.is_deleted = true;
    await message.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    next(error);
  }
};

// Đánh dấu tin nhắn là đã đọc
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;

    // Kiểm tra user có trong conversation không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    const message = await Message.findOne({
      _id: messageId,
      conversationId,
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.is_read = true;
    message.read_at = new Date();
    await message.save();

    // Cập nhật last_read_at trong ConversationParticipant
    participant.last_read_at = new Date();
    await participant.save();

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    next(error);
  }
};

// Gửi sticker
export const sendSticker = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { stickerId, receiverId } = req.body; // Nhận stickerId từ body
    const senderId = req.user?.clerkId;

    // Kiểm tra user có được xác thực không
    if (!req.user || !req.user._id || !senderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Kiểm tra user có tham gia conversation không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    // Tìm conversation và populate participants
    const conversation = await Conversation.findById(conversationId).populate(
      "participants"
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Tìm receiver trong conversation
    const receiverParticipant = conversation.participants.find(
      (p) => p.clerkId !== senderId
    );
    if (!receiverParticipant) {
      return res
        .status(400)
        .json({ message: "No receiver found in conversation" });
    }

    // Tìm sticker dựa trên stickerId
    const sticker = await Sticker.findById(stickerId).lean();
    if (!sticker) {
      return res.status(404).json({ message: "Sticker not found" });
    }

    // Tạo dữ liệu tin nhắn với imageUrl từ sticker
    const messageData = {
      conversationId,
      senderId,
      receiverId: receiverId || receiverParticipant.clerkId,
      content: null, // Không có nội dung văn bản
      imageUrl: sticker.image_url, // Sử dụng image_url từ Sticker
      sent_at: new Date(),
    };

    // Tạo tin nhắn mới
    const message = await Message.create(messageData);

    // Cập nhật last_message của conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      last_message: message._id,
    });

    // Phát tin nhắn qua socket
    req.io.to(conversationId).emit("receive_message", message);

    // Trả về response
    res.status(201).json({
      message: "Sticker sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending sticker:", error);
    next(error);
  }
};

export const sendGif = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { gifUrl, receiverId } = req.body; // Nhận gifUrl từ body
    const senderId = req.user?.clerkId;

    // Kiểm tra user có được xác thực không
    if (!req.user || !req.user._id || !senderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Kiểm tra user có tham gia conversation không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: req.user._id,
    });
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    // Tìm conversation và populate participants
    const conversation = await Conversation.findById(conversationId).populate(
      "participants"
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Tìm receiver trong conversation
    const receiverParticipant = conversation.participants.find(
      (p) => p.clerkId !== senderId
    );
    if (!receiverParticipant) {
      return res
        .status(400)
        .json({ message: "No receiver found in conversation" });
    }

    // Kiểm tra gifUrl có hợp lệ không
    if (!gifUrl || typeof gifUrl !== "string" || !gifUrl.startsWith("http")) {
      return res.status(400).json({ message: "Invalid GIF URL" });
    }

    // Tạo dữ liệu tin nhắn với imageUrl từ GIF
    const messageData = {
      conversationId,
      senderId,
      receiverId: receiverId || receiverParticipant.clerkId,
      content: null, // Không có nội dung văn bản
      imageUrl: gifUrl, // Sử dụng URL của GIF
      sent_at: new Date(),
    };

    // Tạo tin nhắn mới
    const message = await Message.create(messageData);

    // Cập nhật last_message của conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      last_message: message._id,
    });

    // Phát tin nhắn qua socket
    req.io.to(conversationId).emit("receive_message", message);

    // Trả về response
    res.status(201).json({
      message: "GIF sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending GIF:", error);
    next(error);
  }
};