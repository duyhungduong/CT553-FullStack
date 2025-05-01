import mongoose from "mongoose";

const PlaylistTrackSchema = new mongoose.Schema({
  playlist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Playlist",
    required: true,
  },
  track_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "song",
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

const PlaylistTrack = mongoose.model("PlaylistTrack", PlaylistTrackSchema);

export default PlaylistTrack;
