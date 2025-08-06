import { Router } from "express";
import {
  getRecommendations,
  getUserBasedRecommendations,
  getKnowledgeBasedRecommendations,
  getUtilityBasedRecommendations,
  getDemographicBasedRecommendations,
  getContentBasedRecommendations,
  getUserToUserCollaborativeRecommendations,
  getHybridRecommendations,
  getMatrixFactorizationRecommendations,
  getItemBasedRecommendations,
} from "../controller/recommendation.controller.js";
const router = Router();

router.get("/user-based/:userId", getUserBasedRecommendations);
router.get("/item-based/:userId", getRecommendations);

// Thêm các endpoint mới
router.get("/knowledge-based/:userId", getKnowledgeBasedRecommendations); // Knowledge-based Recommendation
router.get("/utility-based/:userId", getUtilityBasedRecommendations); // Utility-based Recommendation
router.get("/demographic-based/:userId", getDemographicBasedRecommendations); // Demographic-based Recommendation
router.get("/content-based/:userId", getContentBasedRecommendations); // Content-based Filtering
router.get("/collaborative-user/:userId", getUserToUserCollaborativeRecommendations); // User-to-User Collaborative Filtering (tối ưu hóa)
router.get("/hybrid/:userId", getHybridRecommendations); // Hybrid Recommendation
router.get("/matrix-factorization/:userId", getMatrixFactorizationRecommendations); // Matrix Factorization (phiên bản đơn giản)

export default router;
