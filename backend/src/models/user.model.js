import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    joined_date: {
      type: Date,
      default: Date.now,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);

