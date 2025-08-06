import mongoose from "mongoose";

const instrumentSchema = new mongoose.Schema({
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
  family: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
});

export const Instrument = mongoose.model("instrument", instrumentSchema);