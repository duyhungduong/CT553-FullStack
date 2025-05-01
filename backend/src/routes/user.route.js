import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getUserById,
  getAllUsersExceptMe,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  getSentPendingRequests,
  declineFriendRequest,
} from "../controller/user.controller.js";
import {
  createConversation,
  getUserConversations,
  getLastMessage, // Thêm hàm getLastMessage
  addParticipantToGroup, // Thêm hàm addParticipantToGroup
  leaveGroup,
} from "../controller/conversation.controller.js";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  markMessageAsRead,
  sendSticker,
  sendGif,
} from "../controller/message.controller.js";
import { User } from "../models/user.model.js";
import {
  createSticker,
  createStickerPack,
  deleteSticker,
  getAllStickerPacks,
  getAllStickers,
  getStickerById,
  getUserStickerPacks,
  purchaseStickerPack,
  updateSticker,
} from "../controller/sticker.controller.js";

const router = Router();
import multer from "multer";
const upload = multer({ dest: "uploads/" });
// User-related routes
router.get("/", protectRoute, getAllUsers);
router.get("/except-me", protectRoute, getAllUsersExceptMe);
router.get("/info", protectRoute, getUserById);

// Friendship-related routes
router.post("/friend-request", protectRoute, sendFriendRequest);
router.put(
  "/friend-request/:friendshipId/accept",
  protectRoute,
  acceptFriendRequest
);
router.get("/friends", protectRoute, getFriends);
router.get("/pending-requests", protectRoute, getPendingRequests);
router.get("/pending-requests-sent", protectRoute, getSentPendingRequests);
router.delete(
  "/friend-request/:friendshipId",
  protectRoute,
  declineFriendRequest
);

// Conversation-related routes
router.post("/conversations/create", protectRoute, createConversation);
router.get("/conversations", protectRoute, getUserConversations);
router.post(
  "/conversations/:conversationId/messages",
  protectRoute,
  sendMessage
);
router.post(
  "/conversations/:conversationId/sticker",
  protectRoute,
  sendSticker
);
router.post("/conversations/:conversationId/gif", protectRoute, sendGif);
router.get(
  "/conversations/:conversationId/messages/:id",
  protectRoute,
  getMessages
);
router.delete(
  "/conversations/:conversationId/messages/:messageId",
  protectRoute,
  deleteMessage
);
router.put(
  "/conversations/:conversationId/messages/:messageId/read",
  protectRoute,
  markMessageAsRead
);

// Thêm các route mới cho conversation
router.get(
  "/conversations/:conversationId/last-message",
  protectRoute,
  getLastMessage
); // Route để lấy last_message
router.post(
  "/conversations/:conversationId/participants",
  protectRoute,
  addParticipantToGroup
); // Route để thêm thành viên vào nhóm
router.post("/conversations/:conversationId/leave", protectRoute, leaveGroup); // Route để rời nhóm

router.post("/stickers", createSticker);
router.get("/stickers", getAllStickers);
router.get("/stickers/:id", getStickerById);
router.put("/stickers/:id", updateSticker);
router.delete("/stickers/:id", deleteSticker);

router.post("/sticker-packs", createStickerPack);
router.get("/sticker-packs", getAllStickerPacks);
router.post("/sticker-packs/purchase", purchaseStickerPack);
router.get("/user/:userId/sticker-packs", getUserStickerPacks);

// Utility route to get user _id from Clerk ID
router.get("/clerk/:clerkId", async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ clerkId }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ _id: user._id });
  } catch (error) {
    console.error("Error fetching user by Clerk ID:", error);
    next(error);
  }
});

export default router;
