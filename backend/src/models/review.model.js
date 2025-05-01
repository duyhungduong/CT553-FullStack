import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    song_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi user chỉ có thể review một bài hát một lần
reviewSchema.index({ user_id: 1, song_id: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
