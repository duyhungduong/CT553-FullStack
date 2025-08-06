import mongoose from "mongoose";

const UserFavoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  track_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "song",
    required: true,
  },
  favorited_at: {
    type: Date,
    default: Date.now,
  },
});

export const UserFavorite = mongoose.model("UserFavorite", UserFavoriteSchema);

