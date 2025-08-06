import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    maxlength: 500,
    default: "",
  },
  imageUrl: {
    type: String,
    required: false,
  },
});
export const Genre = mongoose.model("genre", genreSchema);