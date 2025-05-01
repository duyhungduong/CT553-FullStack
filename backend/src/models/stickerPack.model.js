import mongoose from "mongoose";
const stickerPackSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      is_premium: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    { timestamps: true }
  );
  
  export const StickerPack = mongoose.model("StickerPack", stickerPackSchema);