import { TrackGenre } from "../models/trackGenre.model.js";

export const getAllTrackGenre = async (req, res, next) => {
    try {
        const trackGenres = await TrackGenre.find().populate("track_id").populate("genre_id");
        res.status(200).json(trackGenres);
    } catch (error) {
        next(error);
    }
};

export const getTrackByGenreId = async (req, res, next) => {
    try {
        const { trackGenreId } = req.params;

        const trackGenre = await TrackGenre.findById(trackGenreId);

        if (!trackGenre) {
            return res.status(404).json({ message: "TrackGenre not found" });
        }
        res.status(200).json(trackGenre);
    } catch (error) {
        
    }
};