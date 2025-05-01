import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {  getMessages,  sendMessage } from "../controller/message.controller.js";

const router = Router()

router.post("/:senderId/send/:conversationId", protectRoute, sendMessage);
router.get("/:userId/:conversationId", protectRoute, getMessages);

export default router;