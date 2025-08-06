import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear(),
      default: new Date().getFullYear(),
    },
    imageUrl: {
      type: String,
      required: true,
      // match: [/^https?:\/\/[^\s]+$/, "Invalid URL format"],
    },
    audioUrl: {
      type: String,
      required: true,
      // match: [/^https?:\/\/[^\s]+$/, "Invalid URL format"],
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    streams: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
      required: false,
      default: "peaceful",
    },
    tempo_bpm: {
      type: Number,
      required: false,
      min: 0,
      default: 120,
    },
    key_signature: {
      type: String,
      required: false,
      default: "C",
    },
    time_signature: {
      type: String,
      required: false,
      default: "4/4",
    },
    view_count: {
      type: Number,
      default: 0,
    },
    download_count: {
      type: Number,
      default: 0,
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

export const Song = mongoose.model("song", songSchema);
