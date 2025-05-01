import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: false,
      default:new Date().getFullYear(),
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    total_tracks: {
      type: Number,
      default: 0,
    },
    total_duration: {
      type: Number, 
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    streams: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Album = mongoose.model("album", albumSchema);
