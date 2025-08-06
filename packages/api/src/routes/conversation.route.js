import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addParticipant,
  createConversation,
  getConversationDetails,
  getUserConversations,
  leaveConversation,
} from "../controller/conversation.controller.js";

const router = Router();

router.get("/conversations", protectRoute, getUserConversations);
router.post("/conversations/create", protectRoute, createConversation);
router.post("/conversations/add-participant", protectRoute, addParticipant);
router.delete("/conversations/leave/:conversationId", protectRoute, leaveConversation);
router.get("/conversations/:conversationId", protectRoute, getConversationDetails);

export default router;