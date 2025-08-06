import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    user_id1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_id2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Friendship = mongoose.model("Friendship", friendshipSchema);
