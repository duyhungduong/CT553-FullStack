import mongoose from "mongoose";

// models/SavedQueue.js
const savedQueueSchema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: null,
      },
      tracks: [
        {
          track_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: true,
          },
          position: {
            type: Number,
            required: true,
          },
          source: {
            type: String,
            enum: ["playlist", "album", "radio", "search"],
            required: true,
          },
          source_id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "tracks.source",
            default: null,
          },
        },
      ],
    },
    { timestamps: true }
  );
  
  export const SavedQueue = mongoose.model("SavedQueue", savedQueueSchema);