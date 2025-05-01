import mongoose from "mongoose";
// AlbumTrack Model
const albumTrackSchema = new mongoose.Schema(
  {
    album_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "album",
      required: true,
      index: true,
    },
    track_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
      index: true,
    },
    track_number: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);
export const AlbumTrack = mongoose.model("album_track", albumTrackSchema);
