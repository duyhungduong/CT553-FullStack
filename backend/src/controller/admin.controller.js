import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Artist } from "../models/artist.model.js";
import { Genre } from "../models/genre.model.js";
import { Instrument } from "../models/instrument.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import mongoose from "mongoose";

import PlayHistory from "../models/PlayHistory.model.js"; 
import SkipHistory from "../models/SkipHistory.model.js"; 
import { UserFavorite } from "../models/userfavorite.model.js";
import { Playlist } from "../models/playlist.model.js";
import PlaylistTrack from "../models/playlistTrack.model.js"; 
import { QueueItem } from "../models/queueItem.model.js";
import { SavedQueue } from "../models/savedQueue.model.js";
import { Queue } from "../models/queue.model.js";

export const getAdmin = (req, res) => {
  res.send("Admin route");
};

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      chunk_size: 20000000, // 10MB
      timeout: 180000, // 3 phút
    });
    if (!result || !result.secure_url) {
      throw new Error("Upload failed. No secure URL returned.");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary", error.message);
    throw new Error("Error uploading to Cloudinary: " + error.message);
  }
};

export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res
        .status(400)
        .json({ message: "Please upload audio and image files" });
    }

    const {
      title,
      artist,
      genre,
      releaseYear,
      duration,
      albumId,
      instrument,
      mood,
      tempo,
      keySignature,
      timeSignature,
    } = req.body;
    if (!title || !genre || !releaseYear || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }
    const parsedReleaseYear = parseInt(releaseYear, 10);
    const parsedDuration = parseInt(duration, 10);
    const parsedTempo = parseInt(tempo, 10);
    if (isNaN(parsedReleaseYear) || isNaN(parsedDuration)) {
      return res
        .status(400)
        .json({ message: "Release year and duration must be numbers" });
    }

    const genreIds = Array.isArray(genre) ? genre : JSON.parse(genre || "[]");
    const validGenres = await Genre.find({ _id: { $in: genreIds } });
    if (validGenres.length !== genreIds.length) {
      return res.status(400).json({ message: "Invalid genre ID(s)" });
    }

    const audioUrl = await uploadToCloudinary(req.files.audioFile, "video");
    const imageUrl = await uploadToCloudinary(req.files.imageFile, "image");

    const song = new Song({
      title,
      releaseYear: parsedReleaseYear,
      duration: parsedDuration,
      audioUrl,
      imageUrl,
      album:
        albumId && mongoose.Types.ObjectId.isValid(albumId) ? albumId : null,
      mood: mood || "peaceful",
      tempo_bpm: parsedTempo || 120,
      key_signature: keySignature || "C",
      time_signature: timeSignature || "4/4",
    });

    const instrumentIds = Array.isArray(instrument)
      ? instrument
      : JSON.parse(instrument || "[]");

    await song.save();
    await TrackGenre.insertMany(
      genreIds.map((genreId) => ({ track_id: song._id, genre_id: genreId }))
    );
    await TrackArtist.create([
      { track_id: song._id, artist_id: artist, role: "MAIN_ARTIST" },
    ]);
    if (instrumentIds.length > 0) {
      await TrackInstrument.insertMany(
        instrumentIds.map((instrumentId) => ({
          track_id: song._id,
          instrument_id: instrumentId,
        }))
      );
    }
    if (albumId && mongoose.Types.ObjectId.isValid(albumId)) {
      const album = await Album.findById(albumId);
      if (album) {
        await AlbumTrack.create({
          album_id: albumId,
          track_id: song._id,
          track_number:
            (await AlbumTrack.countDocuments({ album_id: albumId })) + 1,
        });
        await Album.findByIdAndUpdate(albumId, {
          $inc: { total_tracks: 1, total_duration: parsedDuration },
        });
      }
    }

    const [trackArtists, trackGenres, trackInstruments, album] =
      await Promise.all([
        TrackArtist.find({ track_id: song._id }).populate("artist_id").lean(),
        TrackGenre.find({ track_id: song._id }).populate("genre_id").lean(),
        TrackInstrument.find({ track_id: song._id })
          .populate("instrument_id")
          .lean(),
        song.album ? Album.findById(song.album).lean() : Promise.resolve(null),
      ]);

    const populatedSong = {
      ...song.toObject(),
      artists: trackArtists.map((ta) => ta.artist_id),
      genres: trackGenres.map((tg) => tg.genre_id),
      instruments: trackInstruments.map((ti) => ti.instrument_id),
      album,
    };

    res.status(201).json(populatedSong);
  } catch (error) {
    console.error("Error in createSong:", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const song = await Song.findById(id).session(session);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Delete all related data
    await Promise.all([
      TrackArtist.deleteMany({ track_id: id }, { session }),
      TrackGenre.deleteMany({ track_id: id }, { session }),
      TrackInstrument.deleteMany({ track_id: id }, { session }),
      AlbumTrack.deleteMany({ track_id: id }, { session }),
      PlayHistory.deleteMany({ track_id: id }, { session }),
      SkipHistory.deleteMany({ track_id: id }, { session }),
      UserFavorite.deleteMany({ track_id: id }, { session }),
      PlaylistTrack.deleteMany({ track_id: id }, { session }),
      QueueItem.deleteMany({ track_id: id }, { session }),
      SavedQueue.updateMany(
        { "tracks.track_id": id },
        { $pull: { tracks: { track_id: id } } },
        { session }
      )
    ]);

    // Update album stats
    const albumTrack = await AlbumTrack.findOne({ track_id: id }).session(session);
    if (albumTrack) {
      await Album.findByIdAndUpdate(
        albumTrack.album_id,
        {
          $inc: { total_tracks: -1, total_duration: -song.duration }
        },
        { session }
      );
    }

    await Song.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    
    res.status(200).json({ message: "Song and all related data deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in deleteSong:", error);
    next(new Error(`Error deleting song: ${error.message}`));
  } finally {
    session.endSession();
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, releaseYear, description } = req.body;
    if (!title || !releaseYear) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedReleaseYear = parseInt(releaseYear, 10);
    if (isNaN(parsedReleaseYear)) {
      return res.status(400).json({ message: "Release year must be a number" });
    }

    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = await uploadToCloudinary(req.files.imageFile, "image");

    const album = new Album({
      title,
      releaseYear: parsedReleaseYear,
      imageUrl,
      description: description || "",
    });

    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error("Error in createAlbum:", error);
    next(new Error(`Error in ${req.path}: ${error.message}`));
  }
};

export const deleteAlbum = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid album ID" });
    }

    const album = await Album.findById(id).session(session);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const albumTracks = await AlbumTrack.find({ album_id: id }).session(session);
    const trackIds = albumTracks.map((at) => at.track_id);

    // Clean up all related data
    await Promise.all([
      Song.updateMany({ _id: { $in: trackIds } }, { $unset: { album: "" } }, { session }),
      AlbumTrack.deleteMany({ album_id: id }, { session }),
      PlayHistory.deleteMany({ track_id: { $in: trackIds } }, { session }),
      SkipHistory.deleteMany({ track_id: { $in: trackIds } }, { session }),
      UserFavorite.deleteMany({ track_id: { $in: trackIds } }, { session }),
      PlaylistTrack.deleteMany({ track_id: { $in: trackIds } }, { session }),
      QueueItem.deleteMany({ track_id: { $in: trackIds } }, { session }),
      SavedQueue.updateMany(
        { "tracks.track_id": { $in: trackIds } },
        { $pull: { tracks: { track_id: { $in: trackIds } } } },
        { session }
      ),
      Album.findByIdAndDelete(id, { session }),
    ]);

    await session.commitTransaction();
    res.status(200).json({ message: "Album and all related data deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in deleteAlbum:", error);
    next(new Error(`Error deleting album: ${error.message}`));
  } finally {
    session.endSession();
  }
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};

export const createArtist = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Artist name is required" });
    }

    if (!req.files) {
      throw new Error("Image file is required");
    }

    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const artist = new Artist({
      name,
      bio,
      imageUrl,
    });

    await artist.save();

    res.status(201).json(artist);
  } catch (error) {
    console.log("Error in createArtist", error);
    next(new Error(`Error in ${req.path}: ${error.message}`));
  }
};

export const deleteArtist = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    const artist = await Artist.findById(id).session(session);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const trackArtists = await TrackArtist.find({ artist_id: id }).session(session);
    const songIds = trackArtists.map((ta) => ta.track_id);

    // Comprehensive cleanup
    await Promise.all([
      Song.deleteMany({ _id: { $in: songIds } }, { session }),
      TrackArtist.deleteMany({ artist_id: id }, { session }),
      TrackGenre.deleteMany({ track_id: { $in: songIds } }, { session }),
      TrackInstrument.deleteMany({ track_id: { $in: songIds } }, { session }),
      AlbumTrack.deleteMany({ track_id: { $in: songIds } }, { session }),
      PlayHistory.deleteMany({ track_id: { $in: songIds } }, { session }),
      SkipHistory.deleteMany({ track_id: { $in: songIds } }, { session }),
      UserFavorite.deleteMany({ track_id: { $in: songIds } }, { session }),
      PlaylistTrack.deleteMany({ track_id: { $in: songIds } }, { session }),
      QueueItem.deleteMany({ track_id: { $in: songIds } }, { session }),
      SavedQueue.updateMany(
        { "tracks.track_id": { $in: songIds } },
        { $pull: { tracks: { track_id: { $in: songIds } } } },
        { session }
      ),
      Artist.findByIdAndDelete(id, { session }),
    ]);

    await session.commitTransaction();
    res.status(200).json({ message: "Artist and all related data deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in deleteArtist:", error);
    next(new Error(`Error deleting artist: ${error.message}`));
  } finally {
    session.endSession();
  }
};

export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Genre name is required" });
    }

    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const genre = new Genre({
      name,
      description,
      imageUrl,
    });

    await genre.save();

    res.status(201).json(genre);
  } catch (error) {
    console.log("Error in createGenre", error);
    next(new Error(`Error in ${req.path}: ${error.message}`));
  }
};

export const createInstrument = async (req, res, next) => {
  try {
    const { name, description, family } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Instrument name is required" });
    }

    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const instrument = new Instrument({
      name,
      description,
      family,
      imageUrl,
    });

    await instrument.save();

    res.status(201).json(instrument);
  } catch (error) {
    console.log("Error in createInstrument", error);
    next(new Error(`Error in ${req.path}: ${error.message}`));
  }
};

export const updateSong = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const song = await Song.findById(id).session(session);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const { title, releaseYear, duration, artist, genre, instrument, albumId } = req.body;

    // Validation
    if (title && typeof title !== "string") {
      return res.status(400).json({ message: "Title must be a string" });
    }
    const parsedReleaseYear = releaseYear ? parseInt(releaseYear, 10) : undefined;
    const parsedDuration = duration ? parseInt(duration, 10) : undefined;
    if ((releaseYear && isNaN(parsedReleaseYear)) || (duration && isNaN(parsedDuration))) {
      return res.status(400).json({ message: "Release year and duration must be numbers" });
    }
    if (artist && !mongoose.Types.ObjectId.isValid(artist)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    // Handle file uploads
    let imageUrl = song.imageUrl;
    let audioUrl = song.audioUrl;
    if (req.files) {
      if (req.files.imageFile) imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
      if (req.files.audioFile) audioUrl = await uploadToCloudinary(req.files.audioFile, "video");
    }

    const updateData = {
      ...(title && { title }),
      ...(parsedReleaseYear && { releaseYear: parsedReleaseYear }),
      ...(parsedDuration && { duration: parsedDuration }),
      ...(imageUrl !== song.imageUrl && { imageUrl }),
      ...(audioUrl !== song.audioUrl && { audioUrl }),
    };

    // Handle relationships
    if (artist) {
      await TrackArtist.deleteMany({ track_id: id, role: "MAIN_ARTIST" }, { session });
      await TrackArtist.create([{ track_id: id, artist_id: artist, role: "MAIN_ARTIST" }], { session });
    }

    if (genre) {
      const genreIds = Array.isArray(genre) ? genre : JSON.parse(genre || "[]");
      const validGenres = await Genre.find({ _id: { $in: genreIds } }).session(session);
      if (validGenres.length !== genreIds.length) {
        return res.status(400).json({ message: "Invalid genre ID(s)" });
      }
      await TrackGenre.deleteMany({ track_id: id }, { session });
      await TrackGenre.insertMany(
        genreIds.map((genreId) => ({ track_id: id, genre_id: genreId })),
        { session }
      );
    }

    if (instrument) {
      const instrumentIds = Array.isArray(instrument) ? instrument : JSON.parse(instrument || "[]");
      const validInstruments = await Instrument.find({ _id: { $in: instrumentIds } }).session(session);
      if (validInstruments.length !== instrumentIds.length) {
        return res.status(400).json({ message: "Invalid instrument ID(s)" });
      }
      await TrackInstrument.deleteMany({ track_id: id }, { session });
      await TrackInstrument.insertMany(
        instrumentIds.map((instrumentId) => ({ track_id: id, instrument_id: instrumentId })),
        { session }
      );
    }

    if (albumId !== undefined) {
      const oldAlbumTrack = await AlbumTrack.findOne({ track_id: id }).session(session);
      const newAlbumId = albumId && mongoose.Types.ObjectId.isValid(albumId) ? albumId : null;

      if (oldAlbumTrack && (!newAlbumId || oldAlbumTrack.album_id.toString() !== newAlbumId)) {
        await Album.findByIdAndUpdate(oldAlbumTrack.album_id, {
          $inc: { total_tracks: -1, total_duration: -song.duration },
        }, { session });
        await AlbumTrack.deleteOne({ track_id: id }, { session });
      }

      if (newAlbumId && newAlbumId !== (oldAlbumTrack?.album_id?.toString() || null)) {
        const album = await Album.findById(newAlbumId).session(session);
        if (!album) return res.status(400).json({ message: "Invalid album ID" });
        await AlbumTrack.create([{
          album_id: newAlbumId,
          track_id: id,
          track_number: await AlbumTrack.countDocuments({ album_id: newAlbumId }) + 1,
        }], { session });
        await Album.findByIdAndUpdate(newAlbumId, {
          $inc: { total_tracks: 1, total_duration: parsedDuration || song.duration },
        }, { session });
      }
      updateData.album = newAlbumId;
    }

    const updatedSong = await Song.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    await session.commitTransaction();

    const responseSong = await Song.findById(id)
      .populate("album")
      .populate({ path: "artists", populate: { path: "artist_id" } })
      .populate({ path: "genres", populate: { path: "genre_id" } })
      .populate({ path: "instruments", populate: { path: "instrument_id" } })
      .lean();

    res.status(200).json(responseSong);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateSong:", error);
    next(new Error(`Error updating song: ${error.message}`));
  } finally {
    session.endSession();
  }
};

export const updateAlbum = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid album ID" });
    }

    const album = await Album.findById(id).session(session);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const { title, releaseYear, description } = req.body;

    if (title && typeof title !== "string") {
      return res.status(400).json({ message: "Title must be a string" });
    }
    const parsedReleaseYear = releaseYear ? parseInt(releaseYear, 10) : undefined;
    if (releaseYear && isNaN(parsedReleaseYear)) {
      return res.status(400).json({ message: "Release year must be a number" });
    }

    let imageUrl = album.imageUrl;
    if (req.files?.imageFile) {
      imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
    }

    const updateData = {
      ...(title && { title }),
      ...(parsedReleaseYear && { releaseYear: parsedReleaseYear }),
      ...(description !== undefined && { description: description || "" }),
      ...(imageUrl !== album.imageUrl && { imageUrl }),
    };

    const updatedAlbum = await Album.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    await session.commitTransaction();

    const albumTracks = await AlbumTrack.find({ album_id: id }).populate("track_id").lean();
    const responseAlbum = {
      ...updatedAlbum.toObject(),
      tracks: albumTracks.map((at) => at.track_id),
    };

    res.status(200).json(responseAlbum);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateAlbum:", error);
    next(new Error(`Error updating album: ${error.message}`));
  } finally {
    session.endSession();
  }
};
export const updateArtist = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    const artist = await Artist.findById(id).session(session);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const { name, bio } = req.body;

    if (name && (typeof name !== "string" || name.trim() === "")) {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }

    let imageUrl = artist.imageUrl;
    if (req.files?.imageFile) {
      imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
    }

    const updateData = {
      ...(name && { name }),
      ...(bio !== undefined && { bio: bio || "" }),
      ...(imageUrl !== artist.imageUrl && { imageUrl }),
    };

    const updatedArtist = await Artist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    await session.commitTransaction();
    res.status(200).json(updatedArtist);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateArtist:", error);
    next(new Error(`Error updating artist: ${error.message}`));
  } finally {
    session.endSession();
  }
};
