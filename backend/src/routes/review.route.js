import { Router } from "express";

import { createReview, deleteReview, getAllReviews, getReviewById, updateReview } from "../controller/review.controller.js";
const router = Router();

//Review Route
router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;