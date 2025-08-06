import mongoose from "mongoose";

const SkipHistorySchema = new mongoose.Schema({
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
  skipped_at: {
    type: Date,
    default: Date.now,
  },
  play_duration: {
    type: Number,
    required: true,
  },
  skip_type: {
    type: String,
    enum: ["manual", "automatic"],
    required: true,
  },
  reason: {
    type: String,
    required: false,
  },
});

const SkipHistory = mongoose.model("SkipHistory", SkipHistorySchema);
export default SkipHistory;
