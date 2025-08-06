import mongoose from "mongoose";

const stickerPackItemSchema = new mongoose.Schema(
  {
    pack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StickerPack",
      required: true,
    },
    sticker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sticker",
      required: true,
    },
  },
  { timestamps: true }
);

export const StickerPackItem = mongoose.model("StickerPackItem", stickerPackItemSchema);