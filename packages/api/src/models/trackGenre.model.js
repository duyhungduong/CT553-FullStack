import mongoose from "mongoose";

// TrackGenre Model
const trackGenreSchema = new mongoose.Schema(
  {
    track_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
      index: true,
    },
    genre_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "genre",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
export const TrackGenre = mongoose.model("track_genre", trackGenreSchema);
