import { AlbumTrack } from "../models/albumTrack.model.js";

export const getAllAlbumTrack = async (req, res, next) => {
  try {
    const albumTracks = await AlbumTrack.find()
      .populate("album_id")
      .populate("track_id");
    res.status(200).json(albumTracks);
  } catch (error) {
    next(error);
  }
};
