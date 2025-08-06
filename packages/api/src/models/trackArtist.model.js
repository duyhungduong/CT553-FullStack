import mongoose from "mongoose";

// TrackArtist Model
const trackArtistSchema = new mongoose.Schema(
  {
    track_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
      index: true,
    },
    artist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "artist",
      required: true,
      index: true,
    },
    role: { type: String, default: "MAIN_ARTIST", trim: true },
  },
  { timestamps: true }
);
export const TrackArtist = mongoose.model("track_artist", trackArtistSchema);
