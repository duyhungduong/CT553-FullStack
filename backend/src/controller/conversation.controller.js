import { Conversation } from "../models/conversation.model.js"; // Đường dẫn tới model Conversation
import { ConversationParticipant } from "../models/conversationParticipant.model.js"; // Đường dẫn tới model ConversationParticipant
import { User } from "../models/user.model.js"; // Đường dẫn tới model User
import { Message } from "../models/message.model.js"; // Đường dẫn tới model Message
import mongoose from "mongoose";

export const createConversation = async (req, res) => {
  try {
    // Lấy thông tin từ req.body
    const { type, title, participantIds } = req.body;

    // Lấy ID người tạo từ req.user (được thêm bởi protectRoute middleware)
    const creatorId = req.user._id;

    // Kiểm tra dữ liệu đầu vào
    if (!type || !["private", "group"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation type" });
    }
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Participant IDs are required" });
    }
    if (type === "group" && !title) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title is required for group conversations",
        });
    }
    if (type === "private" && participantIds.length !== 1) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Private conversations require exactly one participant",
        });
    }

    // Kiểm tra xem tất cả participantIds có tồn tại không
    const participantsExist = await User.find({ _id: { $in: participantIds } });
    if (participantsExist.length !== participantIds.length) {
      return res
        .status(404)
        .json({
          success: false,
          message: "One or more participants not found",
        });
    }

    // Kiểm tra xem cuộc trò chuyện riêng đã tồn tại chưa (nếu type là private)
    if (type === "private") {
      const existingConversation = await Conversation.findOne({
        type: "private",
        participants: { $all: [creatorId, participantIds[0]], $size: 2 },
      });
      if (existingConversation) {
        return res.status(200).json({
          success: true,
          conversation: existingConversation,
          message: "Private conversation already exists",
        });
      }
    }

    // Tạo cuộc trò chuyện mới
    const conversation = new Conversation({
      type,
      title: type === "group" ? title : undefined,
      participants: [creatorId, ...participantIds], // Bao gồm cả người tạo
      created_by: type === "group" ? creatorId : undefined,
    });

    // Lưu cuộc trò chuyện
    const savedConversation = await conversation.save();

    // Thêm người tham gia
    const participants = participantIds.map((userId) => ({
      conversation: savedConversation._id,
      user: userId,
      role:
        userId.toString() === creatorId.toString() && type === "group"
          ? "admin"
          : "member",
    }));

    // Thêm chính người tạo vào danh sách tham gia
    participants.push({
      conversation: savedConversation._id,
      user: creatorId,
      role: type === "group" ? "admin" : "member",
    });

    await ConversationParticipant.insertMany(participants);

    return res.status(201).json({
      success: true,
      conversation: savedConversation,
      message: `${
        type === "private" ? "Private" : "Group"
      } conversation created successfully`,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.aggregate([
      { $match: { participants: userId, is_active: true } },

      // Lấy last_read_at từ conversationparticipants
      {
        $lookup: {
          from: "conversationparticipants",
          localField: "_id",
          foreignField: "conversation",
          as: "participantData",
          pipeline: [
            { $match: { user: userId } },
            { $project: { last_read_at: 1 } },
          ],
        },
      },

      // Lấy thông tin last_message
      {
        $lookup: {
          from: "messages",
          localField: "last_message",
          foreignField: "_id",
          as: "last_message",
          pipeline: [
            { $match: { is_deleted: false } },
            {
              $project: {
                content: 1,
                imageUrl: 1,
                sent_at: 1,
                senderId: 1,
                is_read: 1,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "clerkId", // Sửa từ _id thành clerkId
                as: "sender",
                pipeline: [
                  { $project: { fullName: 1, imageUrl: 1, clerkId: 1 } },
                ],
              },
            },
            { $unwind: "$sender" },
          ],
        },
      },
      {
        $unwind: {
          path: "$last_message",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lấy thông tin participants
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
          pipeline: [
            { $project: { _id: 1, fullName: 1, imageUrl: 1, clerkId: 1 } },
          ],
        },
      },

      { $sort: { updatedAt: -1 } },

      {
        $project: {
          _id: 1,
          type: 1,
          title: 1,
          participants: 1,
          last_message: 1,
          is_active: 1,
          is_pinned: 1,
          created_by: 1,
          settings: 1,
          createdAt: 1,
          updatedAt: 1,
          last_read_at: { $arrayElemAt: ["$participantData.last_read_at", 0] },
        },
      },
    ]);

    // console.log(JSON.stringify(conversations, null, 2)); // Debug dữ liệu

    return res.status(200).json({
      success: true,
      conversations,
      message: "Conversations retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getLastMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const clerkId = req.user.clerkId; // Lấy clerkId từ req.user (do middleware protectRoute thêm)

    // Tìm user bằng clerkId để lấy _id
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userId = user._id; // Lấy MongoDB _id

    // Kiểm tra conversationId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Tìm cuộc trò chuyện với userId (MongoDB _id)
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      is_active: true,
    }).populate("last_message");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or you are not a participant",
      });
    }

    if (!conversation.last_message) {
      return res.status(200).json({
        success: true,
        last_message: null,
        message: "No messages in this conversation yet",
      });
    }

    const lastMessage = await Message.findById(conversation.last_message)
      .populate({
        path: "senderId",
        select: "fullName imageUrl",
        model: "User",
      })
      .select("content imageUrl sent_at senderId is_read");

    return res.status(200).json({
      success: true,
      last_message: lastMessage,
      message: "Last message retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching last message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const addParticipantToGroup = async (req, res) => {
  try {
    const { conversationId, participantIds } = req.body;
    const userId = req.user._id;

    // Kiểm tra dữ liệu đầu vào
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participant IDs are required",
      });
    }

    // Tìm cuộc trò chuyện
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: "group",
      is_active: true,
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found",
      });
    }

    // Kiểm tra quyền admin
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: userId,
      role: "admin",
    });
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Only admins can add participants",
      });
    }

    // Kiểm tra xem tất cả participantIds có tồn tại không
    const participantsExist = await User.find({ _id: { $in: participantIds } });
    if (participantsExist.length !== participantIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more participants not found",
      });
    }

    // Kiểm tra xem người dùng đã có trong nhóm chưa
    const existingParticipants = await ConversationParticipant.find({
      conversation: conversationId,
      user: { $in: participantIds },
    });
    const existingIds = existingParticipants.map((p) => p.user.toString());
    const newParticipants = participantIds.filter(
      (id) => !existingIds.includes(id.toString())
    );

    if (newParticipants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All participants are already in the group",
      });
    }

    // Thêm thành viên mới
    const newParticipantData = newParticipants.map((userId) => ({
      conversation: conversationId,
      user: userId,
      role: "member",
      invited_by: userId,
    }));
    await ConversationParticipant.insertMany(newParticipantData);

    // Cập nhật danh sách participants trong Conversation
    conversation.participants.push(...newParticipants);
    await conversation.save();

    return res.status(200).json({
      success: true,
      conversation,
      message: "Participants added successfully",
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Kiểm tra conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Tìm cuộc trò chuyện
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: "group",
      is_active: true,
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Group conversation not found",
      });
    }

    // Kiểm tra xem người dùng có trong nhóm không
    const participant = await ConversationParticipant.findOne({
      conversation: conversationId,
      user: userId,
    });
    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "You are not a participant in this group",
      });
    }

    // Nếu là admin duy nhất, không cho rời nhóm
    const adminCount = await ConversationParticipant.countDocuments({
      conversation: conversationId,
      role: "admin",
    });
    if (participant.role === "admin" && adminCount === 1) {
      return res.status(403).json({
        success: false,
        message: "You are the only admin, please assign another admin before leaving",
      });
    }

    // Cập nhật trạng thái rời nhóm
    participant.left_at = Date.now();
    await participant.save();

    // Xóa user khỏi danh sách participants
    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== userId.toString()
    );
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: "You have left the group successfully",
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};