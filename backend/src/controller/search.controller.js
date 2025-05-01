import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";

export const search = async (req, res, next) => {
  try {
    const { q, mood, tempo } = req.query;

    // Validate query parameter 'q'
    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({
        message: "Search query 'q' is required and must be a non-empty string",
      });
    }

    const query = q.trim();

    // Build song query conditions
    const songConditions = {
      title: { $regex: query, $options: "i" }, // Case-insensitive title search
    };

    // Add mood filter if provided
    if (mood && typeof mood === "string" && mood.trim() !== "") {
      songConditions.mood = mood.trim();
    }

    // Add tempo filter if provided
    if (tempo && typeof tempo === "string" && !isNaN(parseInt(tempo))) {
      const tempoValue = parseInt(tempo);
      // Allow a range of ±10 BPM for flexibility
      songConditions.tempo_bpm = { $gte: tempoValue - 10, $lte: tempoValue + 10 };
    }

    // Execute searches in parallel
    const [songs, artists, albums] = await Promise.all([
      // Search songs with filters
      Song.find(songConditions)
        .limit(10)
        .lean()
        .then(async (songs) => {
          const songIds = songs.map((s) => s._id);
          const [trackArtists, trackGenres, trackInstruments, albumTracks] =
            await Promise.all([
              TrackArtist.find({ track_id: { $in: songIds } })
                .populate("artist_id", "_id name imageUrl")
                .lean(),
              TrackGenre.find({ track_id: { $in: songIds } })
                .populate("genre_id", "_id name imageUrl")
                .lean(),
              TrackInstrument.find({ track_id: { $in: songIds } })
                .populate("instrument_id", "_id name imageUrl")
                .lean(),
              AlbumTrack.find({ track_id: { $in: songIds } })
                .populate("album_id", "_id title imageUrl")
                .lean(),
            ]);

          return songs.map((song) => ({
            ...song,
            artists: trackArtists
              .filter((ta) => ta.track_id.toString() === song._id.toString())
              .map((ta) => ta.artist_id),
            genres: trackGenres
              .filter((tg) => tg.track_id.toString() === song._id.toString())
              .map((tg) => tg.genre_id),
            instruments: trackInstruments
              .filter((ti) => ti.track_id.toString() === song._id.toString())
              .map((ti) => ti.instrument_id),
            album:
              albumTracks.find(
                (at) => at.track_id.toString() === song._id.toString()
              )?.album_id || null,
          }));
        }),

      // Search artists by name
      Artist.find({ name: { $regex: query, $options: "i" } })
        .limit(10)
        .lean(),

      // Search albums by title
      Album.find({ title: { $regex: query, $options: "i" } })
        .limit(10)
        .lean()
        .then(async (albums) => {
          const albumIds = albums.map((a) => a._id);
          const albumTracks = await AlbumTrack.find({
            album_id: { $in: albumIds },
          })
            .populate("track_id", "_id title imageUrl audioUrl duration")
            .lean();
          return albums.map((album) => ({
            ...album,
            tracks: albumTracks
              .filter(
                (at) => at.album_id._id.toString() === album._id.toString()
              )
              .map((at) => at.track_id),
          }));
        }),
    ]);

    // Return results
    res.status(200).json({
      results: {
        songs,
        artists,
        albums,
      },
      query,
    });
  } catch (error) {
    console.error("Error in search:", error);
    next(error);
  }
};