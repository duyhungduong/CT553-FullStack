import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewById,
  getReviewsBySong,
  getReviewsByUser,
  updateReview,
} from "../controller/review.controller.js";
import { search } from "../controller/search.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", search);

router.post("/reviews", createReview); // Tạo review mới
router.get("/reviews", getAllReviews); // Lấy tất cả review
router.get("/reviews/:id", getReviewById); // Lấy review theo ID
router.get("/reviews/song/:songId", getReviewsBySong); // Lấy review theo bài hát
router.get("/reviews/user/:userId", getReviewsByUser); // Lấy review theo user
router.put("/reviews/:id", updateReview); // Cập nhật review
router.delete("/reviews/:id", deleteReview); // Xóa review

export default router;
