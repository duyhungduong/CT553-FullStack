import { Review } from "../models/review.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

// Tạo review mới
export const createReview = async (req, res) => {
  try {
    const { user_id, song_id, rating, comment } = req.body;
    // Kiểm tra dữ liệu đầu vào
    if (!user_id || !song_id) {
      return res
        .status(400)
        .json({ message: "user_id and song_id are required" });
    }
    const userExists = await User.findById(user_id);
    const songExists = await Song.findById(song_id);
    if (!userExists) return res.status(404).json({ message: "User not found" });
    if (!songExists) return res.status(404).json({ message: "Song not found" });

    const review = new Review({ user_id, song_id, rating, comment });
    const savedReview = await review.save();
    // await savedReview.populate("user_id").populate("song_id");
    await savedReview.populate("user_id", "fullName imageUrl")
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Error in createReview:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User has already reviewed this song" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy tất cả review với phân trang
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate("user_id", "fullName imageUrl")
      .populate("song_id", "title releaseYear")
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments();

    res.status(200).json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy review theo ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user_id", "fullName imageUrl")
      .populate("song_id", "title releaseYear");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy review theo bài hát với phân trang
export const getReviewsBySong = async (req, res) => {
  try {
    const { songId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ song_id: songId })
      .populate("user_id", "fullName imageUrl")
      .populate("song_id", "title releaseYear")
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ song_id: songId });

    res.status(200).json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy review theo user với phân trang
export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user_id: userId })
      .populate("user_id", "fullName imageUrl")
      .populate("song_id", "title releaseYear")
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user_id: userId });

    res.status(200).json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review
      .populate("user_id", "fullName imageUrl")
      .populate("song_id", "title releaseYear");
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Xóa review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
