import mongoose from "mongoose";

// TrackInstrument Model
const trackInstrumentSchema = new mongoose.Schema(
  {
    track_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "song",
      required: true,
      index: true,
    },
    instrument_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "instrument",
      required: true,
      index: true,
    },
    is_primary: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const TrackInstrument = mongoose.model(
  "track_instrument",
  trackInstrumentSchema
);
