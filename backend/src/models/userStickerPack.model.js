import mongoose from "mongoose";

const userStickerPackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StickerPack",
      required: true,
    },
    purchased_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const UserStickerPack = mongoose.model(
  "UserStickerPack",
  userStickerPackSchema
);
