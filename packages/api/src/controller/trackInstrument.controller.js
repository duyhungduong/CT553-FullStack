import { TrackInstrument } from "../models/trackInstrument.model.js";

export const getAllTrackInstrument = async (req, res, next) => {
  try {
    const trackInstruments = await TrackInstrument.find()
      .populate("track_id")
      .populate("instrument_id");
    res.status(200).json(trackInstruments);
  } catch (error) {
    next(error);
  }
};
