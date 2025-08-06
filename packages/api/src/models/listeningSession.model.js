import mongoose from "mongoose";

// models/ListeningSession.js
const listeningSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      default: null,
    },
    total_duration: {
      type: Number,
      default: 0, // In seconds
    },
    tracks_played: {
      type: Number,
      default: 0,
    },
    device_info: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const ListeningSession = mongoose.model(
  "ListeningSession",
  listeningSessionSchema
);
