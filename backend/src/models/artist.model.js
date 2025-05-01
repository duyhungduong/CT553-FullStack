import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    imageUrl: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
      default:"Vietnam",
    },
    website: {
      type: String,
      required: false,
      default:"",
    },
    joined_date: {
      type: Date,
      default: Date.now,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export const Artist = mongoose.model("artist", artistSchema); 
