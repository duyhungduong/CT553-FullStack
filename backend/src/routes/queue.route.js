import { Router } from "express";
import {
  addToQueue,
  clearQueue,
  endListeningSession,
  getListeningSessions,
  getQueue,
  getSavedQueues,
  loadSavedQueue,
  removeFromQueue,
  reorderQueue,
  saveQueue,
  startListeningSession,
  initializeQueue,
} from "../controller/queue.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);
router.post("/initialize", initializeQueue);
router.get("/:userId", getQueue);
router.post("/add", addToQueue);
router.post("/save", saveQueue);
router.delete("/:userId", clearQueue);
router.delete("/:userId/:queueItemId", removeFromQueue);
router.put("/:userId/reorder", reorderQueue);
router.get("/saved-queues/:userId", getSavedQueues);
router.post("/saved-queues/:userId/:savedQueueId/load", loadSavedQueue);
router.post("/session/start", startListeningSession);
router.put("/session/:sessionId/end", endListeningSession);
router.get("/sessions/:userId", getListeningSessions);

export default router;
