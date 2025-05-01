import { TrackArtist } from "../models/trackArtist.model.js";

export const getAllTrackArtist = async (req, res, next) => {
  try {
    const trackArtists = await TrackArtist.find()
      .populate("track_id")
      .populate("artist_id");
    res.status(200).json(trackArtists);
  } catch (error) {
    next(error);
  }
};
