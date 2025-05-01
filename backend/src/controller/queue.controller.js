import { Queue } from "../models/queue.model.js";
import { Song } from "../models/song.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import mongoose from "mongoose";
import { QueueItem } from "../models/queueItem.model.js";
import { SavedQueue } from "../models/savedQueue.model.js";
import { ListeningSession } from "../models/listeningSession.model.js";

import { Artist } from "../models/artist.model.js";
import { Genre } from "../models/genre.model.js";
import { Instrument } from "../models/instrument.model.js";
import { Album } from "../models/album.model.js";
import { Playlist } from "../models/playlist.model.js";
import PlaylistTrack from "../models/playlistTrack.model.js";
import cloudinary from "../lib/cloudinary.js";
import PlayHistory from "../models/PlayHistory.model.js"; 
import SkipHistory from "../models/SkipHistory.model.js"; 
import { UserFavorite } from "../models/userfavorite.model.js";
import { User } from "../models/user.model.js";


export const initializeQueue = async (req, res, next) => {
  try {
    const { userId, songs, source = "manual" } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!Array.isArray(songs) || songs.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid songs array" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    let queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (queue) {
      await QueueItem.deleteMany({ queue_id: queue._id });
    } else {
      queue = new Queue({ user_id: userObjectId });
      await queue.save();
    }

    // Thêm các bài hát vào QueueItem
    const queueItems = songs.map((track_id, index) => ({
      queue_id: queue._id,
      track_id: new mongoose.Types.ObjectId(track_id),
      position: index + 1,
      source,
      source_id: null, 
    }));
    await QueueItem.insertMany(queueItems);

    // Lấy dữ liệu bài hát và làm giàu dữ liệu
    const songIds = queueItems.map(item => item.track_id);
    const songData = await Song.find({ _id: { $in: songIds } }).lean();
    const [trackArtistsData, trackGenres, trackInstruments, albumTracks] = await Promise.all([
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

    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtistsData.forEach((ta) => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
    });
    trackGenres.forEach((tg) => {
      const songId = tg.track_id.toString();
      if (!genresMap.has(songId)) genresMap.set(songId, []);
      genresMap.get(songId).push(tg.genre_id);
    });
    trackInstruments.forEach((ti) => {
      const songId = ti.track_id.toString();
      if (!instrumentsMap.has(songId)) instrumentsMap.set(songId, []);
      instrumentsMap.get(songId).push(ti.instrument_id);
    });
    albumTracks.forEach((at) => {
      const songId = at.track_id.toString();
      albumsMap.set(songId, at.album_id);
    });

    const enrichedSongs = songData.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    res.status(201).json({
      queue: {
        ...queue.toObject(),
        songs: enrichedSongs,
      },
    });
  } catch (error) {
    console.error("Error in initializeQueue:", error);
    next(error);
  }
};

export const clearQueue = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (!queue) {
      return res.status(404).json({ message: "No active queue found" });
    }

    await QueueItem.deleteMany({ queue_id: queue._id });
    queue.current_track_index = -1; // Reset current track index
    await queue.save();

    res.status(200).json({ message: "Queue cleared successfully", queue });
  } catch (error) {
    console.error("Error in clearQueue:", error);
    next(error);
  }
};

export const removeFromQueue = async (req, res, next) => {
  try {
    const { userId, queueItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(queueItemId)) {
      return res.status(400).json({ message: "Invalid userId or queueItemId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (!queue) {
      return res.status(404).json({ message: "No active queue found" });
    }

    const queueItem = await QueueItem.findOneAndDelete({
      _id: queueItemId,
      queue_id: queue._id,
    });
    if (!queueItem) {
      return res.status(404).json({ message: "Queue item not found" });
    }

    // Reorder remaining items
    const remainingItems = await QueueItem.find({ queue_id: queue._id })
      .sort({ position: 1 })
      .lean();
    for (let i = 0; i < remainingItems.length; i++) {
      remainingItems[i].position = i + 1;
      await QueueItem.updateOne({ _id: remainingItems[i]._id }, { position: i + 1 });
    }

    if (queue.current_track_index >= remainingItems.length) {
      queue.current_track_index = remainingItems.length - 1;
      await queue.save();
    }

    res.status(200).json({ message: "Item removed from queue", queueItem });
  } catch (error) {
    console.error("Error in removeFromQueue:", error);
    next(error);
  }
};

export const reorderQueue = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newOrder } = req.body; // Array of queueItem IDs in new order

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!Array.isArray(newOrder) || newOrder.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid newOrder" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (!queue) {
      return res.status(404).json({ message: "No active queue found" });
    }

    const queueItems = await QueueItem.find({ queue_id: queue._id }).lean();
    if (queueItems.length !== newOrder.length) {
      return res.status(400).json({ message: "New order length does not match queue length" });
    }

    // Update positions based on newOrder
    for (let i = 0; i < newOrder.length; i++) {
      await QueueItem.updateOne(
        { _id: newOrder[i], queue_id: queue._id },
        { position: i + 1 }
      );
    }

    res.status(200).json({ message: "Queue reordered successfully" });
  } catch (error) {
    console.error("Error in reorderQueue:", error);
    next(error);
  }
};

export const getSavedQueues = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const savedQueues = await SavedQueue.find({ user_id: userObjectId })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await SavedQueue.countDocuments({ user_id: userObjectId });

    res.status(200).json({
      savedQueues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getSavedQueues:", error);
    next(error);
  }
};

export const loadSavedQueue = async (req, res, next) => {
  try {
    const { userId, savedQueueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(savedQueueId)) {
      return res.status(400).json({ message: "Invalid userId or savedQueueId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const savedQueue = await SavedQueue.findById(savedQueueId);
    if (!savedQueue || savedQueue.user_id.toString() !== userObjectId.toString()) {
      return res.status(404).json({ message: "Saved queue not found or not owned by user" });
    }

    // Find or create active queue
    let queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (queue) {
      await QueueItem.deleteMany({ queue_id: queue._id }); // Clear existing queue
    } else {
      queue = new Queue({ user_id: userObjectId });
      await queue.save();
    }

    // Add saved queue tracks to active queue
    const queueItems = savedQueue.tracks.map((track, index) => ({
      queue_id: queue._id,
      track_id: track.track_id,
      position: index + 1,
      source: track.source,
      source_id: track.source_id,
    }));
    await QueueItem.insertMany(queueItems);

    // Fetch enriched songs
    const songIds = queueItems.map((item) => item.track_id);
    const songs = await Song.find({ _id: { $in: songIds } }).lean();
    const [trackArtistsData, trackGenres, trackInstruments, albumTracks] = await Promise.all([
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

    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtistsData.forEach((ta) => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
    });
    trackGenres.forEach((tg) => {
      const songId = tg.track_id.toString();
      if (!genresMap.has(songId)) genresMap.set(songId, []);
      genresMap.get(songId).push(tg.genre_id);
    });
    trackInstruments.forEach((ti) => {
      const songId = ti.track_id.toString();
      if (!instrumentsMap.has(songId)) instrumentsMap.set(songId, []);
      instrumentsMap.get(songId).push(ti.instrument_id);
    });
    albumTracks.forEach((at) => {
      const songId = at.track_id.toString();
      albumsMap.set(songId, at.album_id);
    });

    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    res.status(200).json({
      queue: {
        ...queue.toObject(),
        songs: enrichedSongs,
      },
    });
  } catch (error) {
    console.error("Error in loadSavedQueue:", error);
    next(error);
  }
};

export const getListeningSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sessions = await ListeningSession.find({ user_id: userObjectId })
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await ListeningSession.countDocuments({ user_id: userObjectId });

    res.status(200).json({
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getListeningSessions:", error);
    next(error);
  }
};

export const getQueue = async (req, res, next) => {
  try {
    const { userId } = req.params; // Assuming userId comes from params or auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the active queue for the user
    const queue = await Queue.findOne({
      user_id: userObjectId,
      is_active: true,
    });
    if (!queue) {
      return res
        .status(200)
        .json({ queue: null, songs: [], total: 0, page, limit });
    }

    // Fetch queue items
    const queueItems = await QueueItem.find({ queue_id: queue._id })
      .sort({ position: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await QueueItem.countDocuments({ queue_id: queue._id });

    if (!queueItems.length) {
      return res.status(200).json({ queue, songs: [], total, page, limit });
    }

    const songIds = queueItems.map((item) => item.track_id);

    // Fetch song data
    const songs = await Song.find({ _id: { $in: songIds } }).lean();

    // Fetch related data
    const [trackArtistsData, trackGenres, trackInstruments, albumTracks] =
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

    // Map related data
    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtistsData.forEach((ta) => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
    });
    trackGenres.forEach((tg) => {
      const songId = tg.track_id.toString();
      if (!genresMap.has(songId)) genresMap.set(songId, []);
      genresMap.get(songId).push(tg.genre_id);
    });
    trackInstruments.forEach((ti) => {
      const songId = ti.track_id.toString();
      if (!instrumentsMap.has(songId)) instrumentsMap.set(songId, []);
      instrumentsMap.get(songId).push(ti.instrument_id);
    });
    albumTracks.forEach((at) => {
      const songId = at.track_id.toString();
      albumsMap.set(songId, at.album_id);
    });

    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    res.status(200).json({
      queue: {
        ...queue.toObject(),
        songs: enrichedSongs,
      },
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getQueue:", error);
    next(error);
  }
};

export const addToQueue = async (req, res, next) => {
  try {
    const { userId, track_id, source, source_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(track_id)) {
      return res.status(400).json({ message: "Invalid userId or track_id" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const trackObjectId = new mongoose.Types.ObjectId(track_id);

    // Find or create active queue
    let queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (!queue) {
      queue = new Queue({ user_id: userObjectId });
      await queue.save();
    }

    // Calculate next position
    const position = (await QueueItem.countDocuments({ queue_id: queue._id })) + 1;

    // Create queue item
    const queueItem = new QueueItem({
      queue_id: queue._id,
      track_id: trackObjectId,
      position,
      source,
      source_id: source_id ? new mongoose.Types.ObjectId(source_id) : null,
    });
    await queueItem.save();

    // Fetch enriched song data
    const song = await Song.findById(trackObjectId).lean();
    const [trackArtistsData, trackGenres, trackInstruments, albumTracks] = await Promise.all([
      TrackArtist.find({ track_id: trackObjectId })
        .populate("artist_id", "_id name imageUrl")
        .lean(),
      TrackGenre.find({ track_id: trackObjectId })
        .populate("genre_id", "_id name imageUrl")
        .lean(),
      TrackInstrument.find({ track_id: trackObjectId })
        .populate("instrument_id", "_id name imageUrl")
        .lean(),
      AlbumTrack.find({ track_id: trackObjectId })
        .populate("album_id", "_id title imageUrl")
        .lean(),
    ]);

    const enrichedSong = {
      ...song,
      artists: trackArtistsData.map((ta) => ta.artist_id),
      genres: trackGenres.map((tg) => tg.genre_id),
      instruments: trackInstruments.map((ti) => ti.instrument_id),
      album: albumTracks[0]?.album_id || null,
    };

    res.status(201).json({
      queueItem: {
        ...queueItem.toObject(),
        track: enrichedSong,
      },
    });
  } catch (error) {
    console.error("Error in addToQueue:", error);
    next(error);
  }
};

export const saveQueue = async (req, res, next) => {
  try {
    const { userId, name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const queue = await Queue.findOne({ user_id: userObjectId, is_active: true });
    if (!queue) {
      return res.status(404).json({ message: "No active queue found" });
    }

    const queueItems = await QueueItem.find({ queue_id: queue._id })
      .sort({ position: 1 })
      .lean();

    const savedQueue = new SavedQueue({
      user_id: userObjectId,
      name,
      description,
      tracks: queueItems.map((item) => ({
        track_id: item.track_id,
        position: item.position,
        source: item.source,
        source_id: item.source_id,
      })),
    });
    await savedQueue.save();

    res.status(201).json(savedQueue);
  } catch (error) {
    console.error("Error in saveQueue:", error);
    next(error);
  }
};

export const startListeningSession = async (req, res, next) => {
  try {
    const { userId, device_info, ip_address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const session = new ListeningSession({
      user_id: userObjectId,
      start_time: new Date(),
      device_info,
      ip_address,
    });
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    console.error("Error in startListeningSession:", error);
    next(error);
  }
};

export const endListeningSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { total_duration, tracks_played } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    const session = await ListeningSession.findById(sessionId);
    if (!session || session.status === "completed") {
      return res.status(404).json({ message: "Session not found or already completed" });
    }

    session.end_time = new Date();
    session.total_duration = total_duration || 0;
    session.tracks_played = tracks_played || 0;
    session.status = "completed";
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error("Error in endListeningSession:", error);
    next(error);
  }
};