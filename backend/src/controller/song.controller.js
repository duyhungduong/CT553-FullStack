import { Artist } from "../models/artist.model.js";
import { Song } from "../models/song.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { Genre } from "../models/genre.model.js";
import { Instrument } from "../models/instrument.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import { Album } from "../models/album.model.js";
import { Playlist } from "../models/playlist.model.js";
import PlaylistTrack from "../models/playlistTrack.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import PlayHistory from "../models/PlayHistory.model.js";
import SkipHistory from "../models/SkipHistory.model.js";
import { UserFavorite } from "../models/userfavorite.model.js";

import { Essentia } from "essentia.js";
import { readFile } from "fs/promises";
import { AudioContext } from "node-web-audio-api";

export const getRelatedSongs = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 6;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }
    const songObjectId = new mongoose.Types.ObjectId(songId);

    // Lấy thông tin bài hát hiện tại
    const currentSong = await Song.findById(songObjectId).lean();
    if (!currentSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Lấy dữ liệu liên quan song song
    const [trackArtists, trackGenres, trackInstruments, albumTracks] =
      await Promise.all([
        TrackArtist.find({ track_id: songObjectId }).lean(),
        TrackGenre.find({ track_id: songObjectId }).lean(),
        TrackInstrument.find({ track_id: songObjectId }).lean(),
        AlbumTrack.find({ track_id: songObjectId }).lean(),
      ]);

    const artistIds = trackArtists.map((ta) => ta.artist_id);
    const genreIds = trackGenres.map((tg) => tg.genre_id);
    const instrumentIds = trackInstruments.map((ti) => ti.instrument_id);
    const albumIds = albumTracks.map((at) => at.album_id);

    // Tạo pipeline aggregate với tính điểm tương đồng
    const relatedSongs = await Song.aggregate([
      // Lookup các bảng liên quan
      {
        $lookup: {
          from: "track_artists",
          localField: "_id",
          foreignField: "track_id",
          as: "trackArtists",
        },
      },
      {
        $lookup: {
          from: "track_genres",
          localField: "_id",
          foreignField: "track_id",
          as: "trackGenres",
        },
      },
      {
        $lookup: {
          from: "track_instruments",
          localField: "_id",
          foreignField: "track_id",
          as: "trackInstruments",
        },
      },
      {
        $lookup: {
          from: "album_tracks",
          localField: "_id",
          foreignField: "track_id",
          as: "albumTracks",
        },
      },
      // Loại bỏ bài hát hiện tại
      { $match: { _id: { $ne: songObjectId } } },
      // Tính điểm tương đồng
      {
        $addFields: {
          similarityScore: {
            $sum: [
              // Trọng số cho artist (0.4 nếu khớp)
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $setIntersection: [
                            "$trackArtists.artist_id",
                            artistIds,
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  0.4,
                  0,
                ],
              },
              // Trọng số cho genre (0.3 nếu khớp)
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $setIntersection: ["$trackGenres.genre_id", genreIds],
                        },
                      },
                      0,
                    ],
                  },
                  0.3,
                  0,
                ],
              },
              // Trọng số cho instrument (0.1 nếu khớp)
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $setIntersection: [
                            "$trackInstruments.instrument_id",
                            instrumentIds,
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  0.1,
                  0,
                ],
              },
              // Trọng số cho album (0.1 nếu khớp)
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $setIntersection: ["$albumTracks.album_id", albumIds],
                        },
                      },
                      0,
                    ],
                  },
                  0.1,
                  0,
                ],
              },
              // Trọng số cho mood (0.05 nếu khớp)
              { $cond: [{ $eq: ["$mood", currentSong.mood] }, 0.05, 0] },
              // Trọng số cho tempo (0.05 nếu gần giống)
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$tempo_bpm", currentSong.tempo_bpm - 15] },
                      { $lte: ["$tempo_bpm", currentSong.tempo_bpm + 15] },
                    ],
                  },
                  0.05,
                  0,
                ],
              },
              // Trọng số cho key_signature (0.03 nếu khớp)
              {
                $cond: [
                  { $eq: ["$key_signature", currentSong.key_signature] },
                  0.03,
                  0,
                ],
              },
              // Trọng số cho releaseYear (0.02 nếu gần giống)
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$releaseYear", currentSong.releaseYear - 5] },
                      { $lte: ["$releaseYear", currentSong.releaseYear + 5] },
                    ],
                  },
                  0.02,
                  0,
                ],
              },
            ],
          },
        },
      },
      // Lọc các bài có điểm tương đồng > 0
      { $match: { similarityScore: { $gt: 0 } } },
      // Sắp xếp theo điểm tương đồng giảm dần
      { $sort: { similarityScore: -1 } },
      // Giới hạn số lượng kết quả
      { $limit: limit },
      // Lookup thông tin chi tiết
      {
        $lookup: {
          from: "artists",
          localField: "trackArtists.artist_id",
          foreignField: "_id",
          as: "artists",
        },
      },
      {
        $lookup: {
          from: "genres",
          localField: "trackGenres.genre_id",
          foreignField: "_id",
          as: "genres",
        },
      },
      {
        $lookup: {
          from: "instruments",
          localField: "trackInstruments.instrument_id",
          foreignField: "_id",
          as: "instruments",
        },
      },
      // Dự án các trường cần thiết
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          similarityScore: 1, // Để debug, có thể bỏ sau khi test
          artists: {
            $map: {
              input: "$artists",
              as: "artist",
              in: {
                _id: "$$artist._id",
                name: "$$artist.name",
                imageUrl: "$$artist.imageUrl",
              },
            },
          },
          genres: {
            $map: {
              input: "$genres",
              as: "genre",
              in: {
                _id: "$$genre._id",
                name: "$$genre.name",
                imageUrl: "$$genre.imageUrl",
              },
            },
          },
          instruments: {
            $map: {
              input: "$instruments",
              as: "instrument",
              in: {
                _id: "$$instrument._id",
                name: "$$instrument.name",
                imageUrl: "$$instrument.imageUrl",
              },
            },
          },
        },
      },
    ]);

    // Nếu không đủ kết quả, có thể thêm logic lấy ngẫu nhiên các bài phổ biến
    if (relatedSongs.length < limit) {
      const additionalSongs = await Song.aggregate([
        {
          $match: {
            _id: { $ne: songObjectId, $nin: relatedSongs.map((s) => s._id) },
          },
        },
        { $sort: { streams: -1 } }, // Lấy bài phổ biến
        { $limit: limit - relatedSongs.length },
        {
          $project: {
            _id: 1,
            title: 1,
            imageUrl: 1,
          },
        },
      ]);
      relatedSongs.push(...additionalSongs);
    }

    res.status(200).json({ relatedSongs });
  } catch (error) {
    console.error("Error in getRelatedSongs:", error);
    next(error);
  }
};

async function analyzeMood(audioFile) {
  try {
    console.log("Analyzing file:", audioFile.path); // Debug log
    const essentia = new Essentia();
    console.log("Essentia initialized");

    const audioBuffer = await readFile(audioFile.path);
    console.log("Audio file read, size:", audioBuffer.length);

    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(audioBuffer.buffer);
    console.log("Audio decoded, sample rate:", audioData.sampleRate);

    const signal = essentia.arrayToVector(audioData.getChannelData(0));
    console.log("Signal vector created, length:", signal.size);

    const tempo = essentia.PercivalBpmEstimator(signal).bpm;
    const keyData = essentia.KeyExtractor(signal);
    const rhythm = essentia.RhythmExtractor(signal);

    const mood = tempo > 120 ? ["energetic"] : ["relaxing"];

    essentia.deleteVector(signal);
    essentia.shutdown();

    return {
      mood,
      tempo,
      keySignature: keyData.key,
      timeSignature: rhythm.timeSignature || "4/4",
    };
  } catch (error) {
    console.error("Error in analyzeMood:", error.message, error.stack);
    throw new Error(`Mood analysis failed: ${error.message}`);
  }
}

export const analyzeMoodController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }
    console.log("Received file:", req.file); // Debug log
    const metadata = await analyzeMood(req.file);
    res.status(200).json({ predictedMoods: metadata.mood, ...metadata });
  } catch (error) {
    console.error("Error in analyzeMoodController:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getUserFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const favorites = await UserFavorite.find({ user_id: userId })
      .populate("track_id", "_id title imageUrl audioUrl duration")
      .sort({ favorited_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserFavorite.countDocuments({ user_id: userId });

    const songIds = favorites.map((fav) => fav.track_id._id);

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

    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
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

    // Enrich favorite songs with related data
    const enrichedSongs = favorites.map((fav) => ({
      ...fav.track_id,
      favorited_at: fav.favorited_at,
      artists: artistsMap.get(fav.track_id._id.toString()) || [],
      genres: genresMap.get(fav.track_id._id.toString()) || [],
      instruments: instrumentsMap.get(fav.track_id._id.toString()) || [],
      album: albumsMap.get(fav.track_id._id.toString()) || null,
    }));

    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    next(error); // Pass to error middleware, avoid manual response
  }
};

// Ensure other functions reference "song" correctly
export const addSongToFavorites = async (req, res, next) => {
  try {
    const { userId, trackId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: "Invalid track ID" });
    }

    const existingFavorite = await UserFavorite.findOne({
      user_id: userId,
      track_id: trackId,
    });
    if (existingFavorite) {
      return res.status(400).json({ message: "Song is already favorited" });
    }

    const favorite = new UserFavorite({
      user_id: userId,
      track_id: trackId,
    });

    await favorite.save();
    // Tăng lượt likes cho bài hát trong Song model

    // const randomIncrement = Math.floor(Math.random() * 9000) + 1;

    const updatedSong = await Song.updateOne(
      { _id: trackId },
      { $inc: { likes: 1 } },
      { runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Trả về phản hồi thành công
    res.status(201).json({
      message: "Song added to favorites and likes updated",
      favorite,
      updatedLikes: updatedSong.likes,
    });
  } catch (error) {
    console.error("Error in addSongToFavorites:", error);
    next(error);
  }
};

export const removeSongFromFavorites = async (req, res, next) => {
  try {
    const { userId, trackId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: "Invalid track ID" });
    }

    const favorite = await UserFavorite.findOneAndDelete({
      user_id: userId,
      track_id: trackId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({ message: "Song removed from favorites" });
  } catch (error) {
    console.error("Error in removeSongFromFavorites:", error);
    next(error);
  }
};

const uploadToCloudinary = async (file, resourceType = "auto") => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: resourceType,
      chunk_size: 20000000,
      timeout: 180000,
    });
    if (!result?.secure_url) {
      throw new Error("Upload failed: No secure URL returned.");
    }
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw error;
  }
};

// 1. Thêm bản ghi Play History
export const createPlayHistory = async (req, res, next) => {
  try {
    const {
      user_id,
      track_id,
      play_duration: rawPlayDuration,
      source,
      source_id,
      completed,
      device_info,
      ip_address,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Valid user_id is required" });
    }
    if (!track_id || !mongoose.Types.ObjectId.isValid(track_id)) {
      return res.status(400).json({ message: "Valid track_id is required" });
    }

    // Xử lý play_duration: Chuyển đổi và đảm bảo là số không âm
    let play_duration = rawPlayDuration;
    if (typeof rawPlayDuration === "string") {
      play_duration = parseFloat(rawPlayDuration); // Chuyển string thành number
    }
    if (
      typeof play_duration !== "number" ||
      isNaN(play_duration) ||
      play_duration < 0
    ) {
      play_duration = 0;
    }

    if (!source || !["queue", "playlist", "album", "radio"].includes(source)) {
      return res.status(400).json({
        message: "source must be one of: queue, playlist, album, radio",
      });
    }

    const song = await Song.findById(track_id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (source_id && !mongoose.Types.ObjectId.isValid(source_id)) {
      return res.status(400).json({ message: "Invalid source_id" });
    }

    const playHistory = new PlayHistory({
      user_id,
      track_id,
      play_duration, // Sử dụng giá trị đã xử lý
      source,
      source_id: source_id || null,
      completed: completed || false,
      device_info: device_info || "",
      ip_address: ip_address || "",
    });

    await playHistory.save();

    res.status(201).json(playHistory);
  } catch (error) {
    console.error("Error in createPlayHistory:", error);
    next(error);
  }
};

// 2. Lấy lịch sử phát của người dùng (có phân trang)
export const getPlayHistoryByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const playHistory = await PlayHistory.find({ user_id: userId })
      .populate("track_id", "_id title imageUrl audioUrl duration")
      .sort({ played_at: -1 }) // Sắp xếp theo thời gian phát giảm dần
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PlayHistory.countDocuments({ user_id: userId });

    res.status(200).json({
      playHistory,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getPlayHistoryByUser:", error);
    next(error);
  }
};

// 3. Xóa bản ghi Play History
export const deletePlayHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid play history ID" });
    }

    const playHistory = await PlayHistory.findByIdAndDelete(id);
    if (!playHistory) {
      return res.status(404).json({ message: "Play history not found" });
    }

    res.status(200).json({ message: "Play history deleted successfully" });
  } catch (error) {
    console.error("Error in deletePlayHistory:", error);
    next(error);
  }
};

// 4. Thêm bản ghi Skip History
export const createSkipHistory = async (req, res, next) => {
  try {
    const { user_id, track_id, play_duration, skip_type, reason } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Valid user_id is required" });
    }
    if (!track_id || !mongoose.Types.ObjectId.isValid(track_id)) {
      return res.status(400).json({ message: "Valid track_id is required" });
    }
    if (
      !play_duration ||
      typeof play_duration !== "number" ||
      play_duration < 0
    ) {
      return res
        .status(400)
        .json({ message: "play_duration must be a non-negative number" });
    }
    if (!skip_type || !["manual", "automatic"].includes(skip_type)) {
      return res
        .status(400)
        .json({ message: "skip_type must be one of: manual, automatic" });
    }

    // Kiểm tra track_id tồn tại
    const song = await Song.findById(track_id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const skipHistory = new SkipHistory({
      user_id,
      track_id,
      play_duration,
      skip_type,
      reason: reason || "",
    });

    await skipHistory.save();

    res.status(201).json(skipHistory);
  } catch (error) {
    console.error("Error in createSkipHistory:", error);
    next(error);
  }
};

// 5. Lấy lịch sử bỏ qua của người dùng (có phân trang)
export const getSkipHistoryByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const skipHistory = await SkipHistory.find({ user_id: userId })
      .populate("track_id", "_id title imageUrl audioUrl duration")
      .sort({ skipped_at: -1 }) // Sắp xếp theo thời gian bỏ qua giảm dần
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SkipHistory.countDocuments({ user_id: userId });

    res.status(200).json({
      skipHistory,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getSkipHistoryByUser:", error);
    next(error);
  }
};

// 6. Xóa bản ghi Skip History
export const deleteSkipHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid skip history ID" });
    }

    const skipHistory = await SkipHistory.findByIdAndDelete(id);
    if (!skipHistory) {
      return res.status(404).json({ message: "Skip history not found" });
    }

    res.status(200).json({ message: "Skip history deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSkipHistory:", error);
    next(error);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { userId, title, description, isPublic } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({ message: "Title is required and must be a non-empty string" });
    }

    let imageUrl = "";
    if (req.files && req.files.imageFile) {
      imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
    }

    const playlist = new Playlist({
      userId,
      title: title.trim(),
      description: description || "",
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      imageUrl,
    });

    await playlist.save();

    res.status(201).json(playlist);
  } catch (error) {
    console.error("Error in createPlaylist:", error);
    next(error);
  }
};

export const getAllPlaylists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Ensure Playlist model is correctly imported and defined
    if (!Playlist) {
      throw new Error("Playlist model is not defined");
    }

    // Aggregate để lấy thông tin playlists cùng với total_tracks và user
    const playlists = await Playlist.aggregate([
      // Bước 1: Lấy tất cả playlists
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      // Bước 2: Lookup để đếm số tracks trong PlaylistTrack
      {
        $lookup: {
          from: "playlisttracks", // Tên collection của PlaylistTrack
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $addFields: {
          total_tracks: { $size: "$tracks" }, // Tính tổng số tracks
        },
      },

      // Bước 3: Lookup để lấy thông tin user
      {
        $lookup: {
          from: "users", // Tên collection của User
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Giải nén mảng user thành object đơn
      },

      // Bước 4: Project để định dạng output
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          description: 1,
          isPublic: 1,
          imageUrl: 1,
          createdAt: 1,
          updatedAt: 1,
          total_tracks: 1,
          user: {
            _id: "$user._id",
            name: "$user.fullName",
            imageUrl: "$user.imageUrl",
          },
        },
      },
    ]);

    // Đếm tổng số playlists
    const total = await Playlist.countDocuments();

    res.status(200).json({
      playlists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllPlaylists:", error);
    next(error);
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    // Lấy thông tin cơ bản của playlist và thông tin user
    const playlist = await Playlist.findById(id)
      .populate("userId", "_id fullName imageUrl") 
      .lean();
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Lấy danh sách PlaylistTrack và đếm total_tracks
    const playlistTracks = await PlaylistTrack.find({ playlist_id: id })
      .sort({ position: 1 }) // Sắp xếp theo position
      .lean();
    const total_tracks = playlistTracks.length;
    const trackIds = playlistTracks.map((pt) => pt.track_id);

    if (!trackIds.length) {
      return res.status(200).json({
        _id: playlist._id,
        userId: playlist.userId._id,
        title: playlist.title,
        description: playlist.description,
        isPublic: playlist.isPublic,
        imageUrl: playlist.imageUrl,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        total_tracks: 0,
        tracks: [],
        artist: null,
        genres: [],
        user: {
          _id: playlist.userId._id,
          name: playlist.userId.fullName,
          imageUrl: playlist.userId.imageUrl,
        },
      });
    }

    // Lấy thông tin bài hát và các liên kết
    const [songs, trackArtists, trackGenres, trackInstruments] =
      await Promise.all([
        Song.find({ _id: { $in: trackIds } }).lean(),
        TrackArtist.find({ track_id: { $in: trackIds } }).lean(),
        TrackGenre.find({ track_id: { $in: trackIds } }).lean(),
        TrackInstrument.find({ track_id: { $in: trackIds } }).lean(),
      ]);

    // Lấy danh sách ID liên quan
    const artistIds = [...new Set(trackArtists.map((ta) => ta.artist_id))];
    const genreIds = [...new Set(trackGenres.map((tg) => tg.genre_id))];
    const instrumentIds = [
      ...new Set(trackInstruments.map((ti) => ti.instrument_id)),
    ];

    // Lấy thông tin artists, genres, instruments
    const [artists, genres, instruments] = await Promise.all([
      Artist.find({ _id: { $in: artistIds } })
        .select("_id name imageUrl")
        .lean(),
      Genre.find({ _id: { $in: genreIds } })
        .select("_id name imageUrl")
        .lean(),
      Instrument.find({ _id: { $in: instrumentIds } })
        .select("_id name imageUrl")
        .lean(),
    ]);

    // Enrich songs với artists, genres, instruments
    const enrichedSongs = songs.map((song) => {
      const trackPosition = playlistTracks.find((pt) =>
        pt.track_id.equals(song._id)
      );
      return {
        ...song,
        artists: artists.filter((artist) =>
          trackArtists.some(
            (ta) =>
              ta.track_id.equals(song._id) && ta.artist_id.equals(artist._id)
          )
        ),
        genres: genres.filter((genre) =>
          trackGenres.some(
            (tg) =>
              tg.track_id.equals(song._id) && tg.genre_id.equals(genre._id)
          )
        ),
        instruments: instruments.filter((instrument) =>
          trackInstruments.some(
            (ti) =>
              ti.track_id.equals(song._id) &&
              ti.instrument_id.equals(instrument._id)
          )
        ),
        position: trackPosition ? trackPosition.position : 0,
        added_at: trackPosition ? trackPosition.added_at : null,
      };
    });

    // Xác định artist chính của playlist (dựa vào bài hát đầu tiên hoặc logic khác)
    const mainArtistTrack = trackArtists.find((ta) =>
      trackIds.some((id) => id.equals(ta.track_id))
    );
    const playlistArtist = mainArtistTrack
      ? artists.find((a) => a._id.equals(mainArtistTrack.artist_id))
      : null;

    // Trả về playlist với đầy đủ thông tin
    res.status(200).json({
      _id: playlist._id,
      userId: playlist.userId._id,
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      imageUrl: playlist.imageUrl,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      total_tracks,
      tracks: enrichedSongs,
      artist: playlistArtist,
      genres,
      user: {
        _id: playlist.userId._id,
        name: playlist.userId.fullName,
        imageUrl: playlist.userId.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error in getPlaylistById:", error);
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const { title, description, isPublic } = req.body;

    let imageUrl = playlist.imageUrl;
    if (req.files && req.files.imageFile) {
      imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(description !== undefined && { description: description || "" }),
      ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      ...(imageUrl !== playlist.imageUrl && { imageUrl }),
    };

    const updatedPlaylist = await Playlist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "_id fullName imageUrl") // Thêm thông tin user
      .lean();

    // Đếm total_tracks
    const total_tracks = await PlaylistTrack.countDocuments({
      playlist_id: id,
    });

    res.status(200).json({
      _id: updatedPlaylist._id,
      userId: updatedPlaylist.userId._id,
      title: updatedPlaylist.title,
      description: updatedPlaylist.description,
      isPublic: updatedPlaylist.isPublic,
      imageUrl: updatedPlaylist.imageUrl,
      createdAt: updatedPlaylist.createdAt,
      updatedAt: updatedPlaylist.updatedAt,
      total_tracks,
      user: {
        _id: updatedPlaylist.userId._id,
        name: updatedPlaylist.userId.fullName,
        imageUrl: updatedPlaylist.userId.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error in updatePlaylist:", error);
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Kiểm tra quyền (tùy chọn)
    if (req.user && playlist.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this playlist" });
    }

    await PlaylistTrack.deleteMany({ playlist_id: id });
    await Playlist.findByIdAndDelete(id);

    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error in deletePlaylist:", error);
    next(error);
  }
};

export const addTrackToPlaylist = async (req, res, next) => {
  try {
    const { playlistId, trackId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: "Invalid track ID" });
    }

    const playlist = await Playlist.findById(playlistId)
      .populate("userId", "_id fullName imageUrl")
      .lean();
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Không kiểm tra trùng lặp, thêm trực tiếp
    const position =
      (await PlaylistTrack.countDocuments({ playlist_id: playlistId })) + 1;
    const newPlaylistTrack = new PlaylistTrack({
      playlist_id: playlistId,
      track_id: trackId,
      position,
    });
    await newPlaylistTrack.save();

    // Lấy danh sách tracks sau khi thêm
    const updatedTracks = await PlaylistTrack.find({ playlist_id: playlistId })
      .populate(
        "track_id",
        "_id title imageUrl duration artists genres streams"
      )
      .lean();

    const total_tracks = updatedTracks.length;
    const tracks = updatedTracks.map((pt) => ({
      ...pt.track_id,
      position: pt.position,
    }));

    res.status(200).json({
      _id: playlist._id,
      userId: playlist.userId._id,
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      imageUrl: playlist.imageUrl,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      total_tracks,
      tracks, // Trả về danh sách tracks đầy đủ
      user: {
        _id: playlist.userId._id,
        name: playlist.userId.fullName,
        imageUrl: playlist.userId.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error in addTrackToPlaylist:", error);
    next(error);
  }
};

export const removeTrackFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId, trackId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trackId)) {
      return res.status(400).json({ message: "Invalid track ID" });
    }

    const playlist = await Playlist.findById(playlistId)
      .populate("userId", "_id fullName imageUrl")
      .lean();
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const playlistTrack = await PlaylistTrack.findOneAndDelete({
      playlist_id: playlistId,
      track_id: trackId,
    });
    if (!playlistTrack) {
      return res.status(404).json({ message: "Track not found in playlist" });
    }

    // Cập nhật lại position của các track còn lại
    await PlaylistTrack.updateMany(
      { playlist_id: playlistId, position: { $gt: playlistTrack.position } },
      { $inc: { position: -1 } }
    );

    // Lấy danh sách tracks còn lại
    const remainingTracks = await PlaylistTrack.find({
      playlist_id: playlistId,
    })
      .populate(
        "track_id",
        "_id title imageUrl duration artists genres streams"
      ) // Populate thông tin track
      .lean();

    const total_tracks = remainingTracks.length;
    const tracks = remainingTracks.map((pt) => ({
      ...pt.track_id,
      position: pt.position,
    }));

    res.status(200).json({
      _id: playlist._id,
      userId: playlist.userId._id,
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      imageUrl: playlist.imageUrl,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      total_tracks,
      tracks, // Thêm danh sách tracks vào response
      user: {
        _id: playlist.userId._id,
        name: playlist.userId.fullName,
        imageUrl: playlist.userId.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error in removeTrackFromPlaylist:", error);
    next(error);
  }
};

export const getAllSongs = async (req, res, next) => {
  try {
    // Lấy tham số phân trang từ query (nếu có)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Lấy tất cả bài hát với phân trang và sắp xếp theo createdAt giảm dần
    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Sử dụng lean() để tăng hiệu suất

    if (!songs.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    // Lấy tất cả ID bài hát để truy vấn dữ liệu liên quan
    const songIds = songs.map((song) => song._id);

    // Truy vấn dữ liệu từ các bảng liên quan song song
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

    // Tổng số bài hát (cho phân trang)
    const total = await Song.countDocuments();

    // Tạo map để ánh xạ dữ liệu liên quan theo songId
    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
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
      albumsMap.set(songId, at.album_id); // Một bài hát chỉ thuộc một album
    });

    // Kết hợp dữ liệu bài hát với dữ liệu liên quan
    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    // Trả về phản hồi với phân trang
    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllSongs:", error);
    next(error);
  }
};
export const searchSongs = async (req, res, next) => {
  try {
    // Lấy tham số từ query
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Nếu không có query, trả về lỗi
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Chuẩn hóa query (loại bỏ dấu, chuyển thành lowercase)
    const normalizedQuery = query.trim().toLowerCase();

    // Tạo điều kiện tìm kiếm cho bài hát
    const songQuery = {
      $or: [
        { title: { $regex: normalizedQuery, $options: 'i' } }, // Tìm kiếm không phân biệt hoa thường
      ],
    };

    // Tìm kiếm nghệ sĩ theo tên
    const artists = await Artist.find({
      name: { $regex: normalizedQuery, $options: 'i' },
    }).select('_id').lean();

    const artistIds = artists.map(artist => artist._id);

    // Tìm kiếm thể loại theo tên
    const genres = await Genre.find({
      name: { $regex: normalizedQuery, $options: 'i' },
    }).select('_id').lean();

    const genreIds = genres.map(genre => genre._id);

    // Tìm kiếm album theo tiêu đề
    const albums = await Album.find({
      title: { $regex: normalizedQuery, $options: 'i' },
    }).select('_id').lean();

    const albumIds = albums.map(album => album._id);

    // Tìm kiếm bài hát liên quan đến nghệ sĩ, thể loại, album
    const [trackArtists, trackGenres, albumTracks] = await Promise.all([
      TrackArtist.find({ artist_id: { $in: artistIds } }).select('track_id').lean(),
      TrackGenre.find({ genre_id: { $in: genreIds } }).select('track_id').lean(),
      AlbumTrack.find({ album_id: { $in: albumIds } }).select('track_id').lean(),
    ]);

    // Lấy danh sách track_id từ các bảng liên quan
    const relatedTrackIds = [
      ...trackArtists.map(ta => ta.track_id),
      ...trackGenres.map(tg => tg.track_id),
      ...albumTracks.map(at => at.track_id),
    ];

    // Thêm điều kiện tìm kiếm cho các track_id liên quan
    if (relatedTrackIds.length > 0) {
      songQuery.$or.push({ _id: { $in: relatedTrackIds } });
    }

    // Tìm kiếm bài hát với phân trang và sắp xếp
    const songs = await Song.find(songQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!songs.length) {
      return res.status(200).json({ songs: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    }

    // Lấy tất cả ID bài hát để truy vấn dữ liệu liên quan
    const songIds = songs.map(song => song._id);

    // Truy vấn dữ liệu từ các bảng liên quan song song
    const [relatedTrackArtists, relatedTrackGenres, relatedTrackInstruments, relatedAlbumTracks] =
      await Promise.all([
        TrackArtist.find({ track_id: { $in: songIds } })
          .populate('artist_id', '_id name imageUrl')
          .lean(),
        TrackGenre.find({ track_id: { $in: songIds } })
          .populate('genre_id', '_id name imageUrl')
          .lean(),
        TrackInstrument.find({ track_id: { $in: songIds } })
          .populate('instrument_id', '_id name imageUrl')
          .lean(),
        AlbumTrack.find({ track_id: { $in: songIds } })
          .populate('album_id', '_id title imageUrl')
          .lean(),
      ]);

    // Tổng số bài hát (cho phân trang)
    const total = await Song.countDocuments(songQuery);

    // Tạo map để ánh xạ dữ liệu liên quan theo songId
    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    relatedTrackArtists.forEach(ta => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
    });

    relatedTrackGenres.forEach(tg => {
      const songId = tg.track_id.toString();
      if (!genresMap.has(songId)) genresMap.set(songId, []);
      genresMap.get(songId).push(tg.genre_id);
    });

    relatedTrackInstruments.forEach(ti => {
      const songId = ti.track_id.toString();
      if (!instrumentsMap.has(songId)) instrumentsMap.set(songId, []);
      instrumentsMap.get(songId).push(ti.instrument_id);
    });

    relatedAlbumTracks.forEach(at => {
      const songId = at.track_id.toString();
      albumsMap.set(songId, at.album_id);
    });

    // Kết hợp dữ liệu bài hát với dữ liệu liên quan
    const enrichedSongs = songs.map(song => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    // Trả về phản hồi với phân trang
    res.status(200).json({
      songs: enrichedSongs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in searchSongs:', error);
    next(error);
  }
};
export const getRecentSongs = async (req, res, next) => {
  try {
    // Lấy tham số phân trang từ query (nếu có)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); //Thay doi: lay 30 ngay gan nhat

    // Lấy các bài hát gần đây với phân trang và sắp xếp theo createdAt giảm dần
    const songs = await Song.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo giảm dần (mới nhất trước)
      .skip(skip)
      .limit(limit)
      .lean(); // Tăng hiệu suất với lean()

    if (!songs.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    // Lấy tất cả ID bài hát để truy vấn dữ liệu liên quan
    const songIds = songs.map((song) => song._id);

    // Truy vấn dữ liệu từ các bảng liên quan song song
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

    // Tổng số bài hát (cho phân trang)
    const total = await Song.countDocuments();

    // Tạo map để ánh xạ dữ liệu liên quan theo songId
    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
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
      albumsMap.set(songId, at.album_id); // Một bài hát chỉ thuộc một album
    });

    // Kết hợp dữ liệu bài hát với dữ liệu liên quan
    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    // Trả về phản hồi với phân trang
    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getRecentSongs:", error);
    next(error);
  }
};

export const increaseSongStreams = async (req, res, next) => {
  try {
    const { songId } = req.params;

    // Kiểm tra songId hợp lệ trước khi query
    if (!mongoose.isValidObjectId(songId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    // Sử dụng updateOne thay vì findByIdAndUpdate để tối ưu hơn
    const updateResult = await Song.updateOne(
      { _id: songId },
      {
        $inc: {
          streams: 1,
          view_count: 1,
        },
      },
      { runValidators: true }
    );

    // Kiểm tra xem có document nào được cập nhật không
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Lấy document sau khi cập nhật nếu cần trả về
    const updatedSong = await Song.findById(songId).lean();

    res.status(200).json(updatedSong);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      {
        $lookup: {
          from: "track_artists",
          localField: "_id",
          foreignField: "track_id",
          as: "trackArtists",
        },
      },
      {
        $lookup: {
          from: "artists",
          localField: "trackArtists.artist_id",
          foreignField: "_id",
          as: "artists",
        },
      },
      {
        $lookup: {
          from: "album_tracks",
          localField: "_id",
          foreignField: "track_id",
          as: "albumTracks",
        },
      },
      { $unwind: { path: "$albumTracks", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "albums",
          localField: "albumTracks.album_id",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: { path: "$album", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "track_genres",
          localField: "_id",
          foreignField: "track_id",
          as: "trackGenres",
        },
      },
      {
        $lookup: {
          from: "genres",
          localField: "trackGenres.genre_id",
          foreignField: "_id",
          as: "genres",
        },
      },
      {
        $lookup: {
          from: "track_instruments",
          localField: "_id",
          foreignField: "track_id",
          as: "trackInstruments",
        },
      },
      {
        $lookup: {
          from: "instruments",
          localField: "trackInstruments.instrument_id",
          foreignField: "_id",
          as: "instruments",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          audioUrl: 1,
          artists: { _id: 1, name: 1, imageUrl: 1 },
          album: {
            _id: "$album._id",
            title: "$album.title",
            imageUrl: "$album.imageUrl",
          },
          genres: { _id: 1, name: 1, imageUrl: 1 },
          instruments: { _id: 1, name: 1, imageUrl: 1 },
        },
      },
    ]);

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const getSongById = async (req, res, next) => {
  try {
    const { songId } = req.params;

    // Tìm bài hát theo ID
    const song = await Song.findById(songId).lean();
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Lấy danh sách nghệ sĩ
    const trackArtists = await TrackArtist.find({ track_id: songId }).lean();
    const artistIds = trackArtists.map((ta) => ta.artist_id);
    const artists = await Artist.find({ _id: { $in: artistIds } })
      .select("_id name imageUrl")
      .lean();

    // Lấy danh sách thể loại
    const trackGenres = await TrackGenre.find({ track_id: songId }).lean();
    const genreIds = trackGenres.map((tg) => tg.genre_id);
    const genres = await Genre.find({ _id: { $in: genreIds } })
      .select("_id name imageUrl")
      .lean();

    // Lấy danh sách nhạc cụ
    const trackInstruments = await TrackInstrument.find({
      track_id: songId,
    }).lean();
    const instrumentIds = trackInstruments.map((ti) => ti.instrument_id);
    const instruments = await Instrument.find({ _id: { $in: instrumentIds } })
      .select("_id name imageUrl")
      .lean();

    // Tìm album có chứa bài hát
    const albumTrack = await AlbumTrack.findOne({ track_id: songId }).lean();
    let album = null;
    if (albumTrack) {
      album = await Album.findById(albumTrack.album_id)
        .select("_id title imageUrl")
        .lean();
    }
    // Trả về dữ liệu theo interface yêu cầu
    res.status(200).json({
      ...song,
      artists,
      genres,
      instruments,
      album,
    });
  } catch (error) {
    next(error);
  }
};

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      {
        $lookup: {
          from: "track_artists",
          localField: "_id",
          foreignField: "track_id",
          as: "trackArtists",
        },
      },
      {
        $lookup: {
          from: "artists",
          localField: "trackArtists.artist_id",
          foreignField: "_id",
          as: "artists",
        },
      },
      {
        $lookup: {
          from: "album_tracks",
          localField: "_id",
          foreignField: "track_id",
          as: "albumTracks",
        },
      },
      { $unwind: { path: "$albumTracks", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "albums",
          localField: "albumTracks.album_id",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: { path: "$album", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          audioUrl: 1,
          artists: { _id: 1, name: 1, imageUrl: 1 },
          album: {
            _id: "$album._id",
            title: "$album.title",
            imageUrl: "$album.imageUrl",
          },
        },
      },
    ]);

    res.json(songs);
  } catch (error) {
    next(error);
  }
};
export const getSongsByGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params; // Lấy genreId từ params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Kiểm tra genreId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(genreId)) {
      return res.status(400).json({ message: "Invalid genreId" });
    }
    const genreObjectId = new mongoose.Types.ObjectId(genreId);

    // Tìm các track_id thuộc thể loại được chọn
    const trackGenres = await TrackGenre.find({ genre_id: genreObjectId })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!trackGenres.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    // console.log("trackGenres", trackGenres)

    const songIds = trackGenres.map((tg) => tg.track_id);
    const total = await TrackGenre.countDocuments({ genre_id: genreObjectId });

    // Lấy thông tin bài hát
    const songs = await Song.find({ _id: { $in: songIds } }).lean();

    if (!songs.length) {
      // console.log("No songs found for songIds:", songIds);
    }

    // console.log("")

    // Truy vấn dữ liệu liên quan
    const [trackArtists, trackInstruments, albumTracks] = await Promise.all([
      TrackArtist.find({ track_id: { $in: songIds } })
        .populate("artist_id", "_id name imageUrl")
        .lean(),
      TrackInstrument.find({ track_id: { $in: songIds } })
        .populate("instrument_id", "_id name imageUrl")
        .lean(),
      AlbumTrack.find({ track_id: { $in: songIds } })
        .populate("album_id", "_id title imageUrl")
        .lean(),
    ]);

    const artistsMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
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
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getSongsByGenre:", error);
    next(error);
  }
};

export const getSongsByInstrument = async (req, res, next) => {
  try {
    const { instrumentId } = req.params; // Lấy instrumentId từ params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Kiểm tra instrumentId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({ message: "Invalid instrumentId" });
    }
    const instrumentObjectId = new mongoose.Types.ObjectId(instrumentId);

    // Tìm các track_id sử dụng nhạc cụ được chọn
    const trackInstruments = await TrackInstrument.find({
      instrument_id: instrumentObjectId,
    })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!trackInstruments.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    const songIds = trackInstruments.map((ti) => ti.track_id);
    const total = await TrackInstrument.countDocuments({
      instrument_id: instrumentObjectId,
    });

    // Lấy thông tin bài hát
    const songs = await Song.find({ _id: { $in: songIds } }).lean();

    if (!songs.length) {
      // console.log("No songs found for songIds:", songIds);
    }

    // Truy vấn dữ liệu liên quan
    const [trackArtists, trackInstrumentsData, albumTracks] = await Promise.all(
      [
        TrackArtist.find({ track_id: { $in: songIds } })
          .populate("artist_id", "_id name imageUrl")
          .lean(),
        TrackInstrument.find({ track_id: { $in: songIds } })
          .populate("instrument_id", "_id name imageUrl")
          .lean(),
        AlbumTrack.find({ track_id: { $in: songIds } })
          .populate("album_id", "_id title imageUrl")
          .lean(),
      ]
    );

    const artistsMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
      const songId = ta.track_id.toString();
      if (!artistsMap.has(songId)) artistsMap.set(songId, []);
      artistsMap.get(songId).push(ta.artist_id);
    });
    trackInstrumentsData.forEach((ti) => {
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
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getSongsByInstrument:", error);
    next(error);
  }
};

export const getRandomSongs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const songs = await Song.aggregate([{ $sample: { size: limit } }]);

    if (!songs.length) {
      return res.status(200).json({ songs: [], total: 0 });
    }

    const songIds = songs.map((song) => song._id);

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

    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
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
      songs: enrichedSongs,
      total: limit, // Không cần phân trang nên total bằng limit
    });
  } catch (error) {
    console.error("Error in getRandomSongs:", error);
    next(error);
  }
};
export const getTrendingSongs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Tính thời điểm 30 ngày trước
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Lấy danh sách bài hát thịnh hành dựa trên PlayHistory
    const trendingSongs = await PlayHistory.aggregate([
      { $match: { played_at: { $gte: thirtyDaysAgo } } }, // Sửa playedAt thành played_at
      { $group: { _id: "$track_id", playCount: { $sum: 1 } } },
      { $sort: { playCount: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "songs", // Giữ nguyên nếu collection là "songs"
          localField: "_id",
          foreignField: "_id",
          as: "song",
        },
      },
      { $unwind: "$song" },
      { $project: { song: 1, playCount: 1 } },
    ]);

    if (!trendingSongs.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    const songIds = trendingSongs.map((item) => item.song._id);
    const total = await PlayHistory.distinct("track_id", {
      played_at: { $gte: thirtyDaysAgo }, // Sửa playedAt thành played_at
    }).then((ids) => ids.length);

    // Truy vấn dữ liệu liên quan
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

    // Ánh xạ dữ liệu
    const artistsMap = new Map();
    const genresMap = new Map();
    const instrumentsMap = new Map();
    const albumsMap = new Map();

    trackArtists.forEach((ta) => {
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

    const enrichedSongs = trendingSongs.map((item) => ({
      ...item.song,
      playCount: item.playCount,
      artists: artistsMap.get(item.song._id.toString()) || [],
      genres: genresMap.get(item.song._id.toString()) || [],
      instruments: instrumentsMap.get(item.song._id.toString()) || [],
      album: albumsMap.get(item.song._id.toString()) || null,
    }));

    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getTrendingSongs:", error);
    next(error);
  }
};

export const getSongsByArtist = async (req, res, next) => {
  try {
    const { artistId } = req.params; // Lấy artistId từ params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Kiểm tra artistId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artistId" });
    }
    const artistObjectId = new mongoose.Types.ObjectId(artistId);

    // Tìm các track_id thuộc nghệ sĩ được chọn
    const trackArtists = await TrackArtist.find({ artist_id: artistObjectId })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!trackArtists.length) {
      return res.status(200).json({ songs: [], total: 0, page, limit });
    }

    const songIds = trackArtists.map((ta) => ta.track_id);
    const total = await TrackArtist.countDocuments({
      artist_id: artistObjectId,
    });

    // Lấy thông tin bài hát
    const songs = await Song.find({ _id: { $in: songIds } }).lean();

    if (!songs.length) {
      // console.log("No songs found for songIds:", songIds);
    }

    // Truy vấn dữ liệu liên quan
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

    // Ánh xạ dữ liệu
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

    // Kết hợp dữ liệu bài hát với dữ liệu liên quan
    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artistsMap.get(song._id.toString()) || [],
      genres: genresMap.get(song._id.toString()) || [],
      instruments: instrumentsMap.get(song._id.toString()) || [],
      album: albumsMap.get(song._id.toString()) || null,
    }));

    // Trả về phản hồi với phân trang
    res.status(200).json({
      songs: enrichedSongs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getSongsByArtist:", error);
    next(error);
  }
};
