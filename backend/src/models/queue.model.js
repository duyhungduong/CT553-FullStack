import mongoose from "mongoose";
const queueSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_shuffle: {
      type: Boolean,
      default: false,
    },
    repeat_mode: {
      type: String,
      enum: ["off", "none", "one", "all", "song" , "queue"],
      default: "off",
    },
    current_track_index: {
      type: Number,
      default: -1,
    },
  },
  { timestamps: true }
);

export const Queue = mongoose.model("Queue", queueSchema);
