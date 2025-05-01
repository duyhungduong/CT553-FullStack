import mongoose from "mongoose";

const PlayHistorySchema = new mongoose.Schema({
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
  played_at: {
    type: Date,
    default: Date.now,
  },
  play_duration: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ["queue", "playlist", "album", "radio"],
    required: true,
  },
  source_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  device_info: {
    type: String,
    required: false,
  },
  ip_address: {
    type: String,
    required: false,
  },
});

const PlayHistory = mongoose.model("PlayHistory", PlayHistorySchema);

export default PlayHistory;
