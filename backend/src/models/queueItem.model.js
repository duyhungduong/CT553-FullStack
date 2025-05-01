import mongoose from "mongoose";
// models/QueueItem.js
const queueItemSchema = new mongoose.Schema(
  {
    queue_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
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
    source: {
      type: String,
      enum: ["playlist", "album", "radio", "search", "manual"],
      required: true,
    },
    source_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "source", // Dynamic reference based on source type
      default: null,
    },
  },
  { timestamps: true }
);

export const QueueItem = mongoose.model("QueueItem", queueItemSchema);
