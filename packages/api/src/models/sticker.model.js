// sticker.model.js
import mongoose from "mongoose";

const stickerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
      match: [/^https?:\/\/[^\s]+$/, "Invalid URL format"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Sticker = mongoose.model("Sticker", stickerSchema);