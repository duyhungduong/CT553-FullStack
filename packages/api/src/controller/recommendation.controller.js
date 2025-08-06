import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { Playlist } from "../models/playlist.model.js";
import PlaylistTrack from "../models/playlistTrack.model.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";
import { Genre } from "../models/genre.model.js";
import { Instrument } from "../models/instrument.model.js"; // Import SkipHistory mới
import PlayHistory from "../models/PlayHistory.model.js";
import SkipHistory from "../models/SkipHistory.model.js";
import { UserFavorite } from "../models/userfavorite.model.js";
import { SparseMatrix } from "mathjs";
import { Friendship } from "../models/friendship.model.js";

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
};

const buildSparseMatrix = (userSongMap, allSongIds) => {
  const matrix = new SparseMatrix();
  const userIdToIdx = new Map();
  let idx = 0;

  userSongMap.forEach((songs, userId) => {
    if (!userIdToIdx.has(userId)) userIdToIdx.set(userId, idx++);
    const userIdx = userIdToIdx.get(userId);
    songs.forEach((songId) => {
      const songIdx = allSongIds.indexOf(songId);
      if (songIdx !== -1) matrix.set([userIdx, songIdx], 1);
    });
  });
  return { matrix, userIdToIdx };
};

// Hàm xây dựng ma trận thưa thớt cho Item-based CF
const buildSongUserMatrix = (songUserMap, allUserIds) => {
  const matrix = new SparseMatrix();
  const songIdToIdx = new Map();
  let idx = 0;

  songUserMap.forEach((users, songId) => {
    if (!songIdToIdx.has(songId)) songIdToIdx.set(songId, idx++);
    const songIdx = songIdToIdx.get(songId);
    users.forEach((score, userId) => {
      const userIdx = allUserIds.indexOf(userId);
      if (userIdx !== -1) matrix.set([songIdx, userIdx], score);
    });
  });
  return { matrix, songIdToIdx };
};

const cosineSimilaritySparse = (matrix, userAIdx, userBIdx, size) => {
  const vecA = Array(size).fill(0);
  const vecB = Array(size).fill(0);
  matrix.forEach((value, [row, col]) => {
    if (row === userAIdx) vecA[col] = value;
    if (row === userBIdx) vecB[col] = value;
  });
  return cosineSimilarity(vecA, vecB);
};

const fetchSongDetails = async (songs) => {
  const songIds = songs.map((s) => s._id);
  const [trackArtists, trackGenres, trackInstruments, albumTracks] =
    await Promise.all([
      TrackArtist.find({ track_id: { $in: songIds } }).lean(),
      TrackGenre.find({ track_id: { $in: songIds } }).lean(),
      TrackInstrument.find({ track_id: { $in: songIds } }).lean(),
      AlbumTrack.find({ track_id: { $in: songIds } }).lean(),
    ]);

  const artistIds = trackArtists.map((ta) => ta.artist_id);
  const genreIds = trackGenres.map((tg) => tg.genre_id);
  const instrumentIds = trackInstruments.map((ti) => ti.instrument_id);
  const albumIds = albumTracks.map((at) => at.album_id);

  const [artists, genres, instruments, albums] = await Promise.all([
    Artist.find({ _id: { $in: artistIds } }).lean(),
    Genre.find({ _id: { $in: genreIds } }).lean(),
    Instrument.find({ _id: { $in: instrumentIds } }).lean(),
    Album.find({ _id: { $in: albumIds } }).lean(),
  ]);

  return songs.map((song) => ({
    ...song,
    artists: artists.filter((a) =>
      trackArtists.some(
        (ta) => ta.track_id.equals(song._id) && ta.artist_id.equals(a._id)
      )
    ),
    genres: genres.filter((g) =>
      trackGenres.some(
        (tg) => tg.track_id.equals(song._id) && tg.genre_id.equals(g._id)
      )
    ),
    instruments: instruments.filter((i) =>
      trackInstruments.some(
        (ti) => ti.track_id.equals(song._id) && ti.instrument_id.equals(i._id)
      )
    ),
    album:
      albums.find((a) =>
        albumTracks.some(
          (at) => at.track_id.equals(song._id) && at.album_id.equals(a._id)
        )
      ) || null,
  }));
};

// Hàm chính cho Item-based Collaborative Filtering
export const getItemBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Truy vấn dữ liệu người dùng để lấy các bài hát đã tương tác
    const userData = await Playlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "playhistories",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
            {
              $lookup: {
                from: "songs",
                localField: "track_id",
                foreignField: "_id",
                as: "song",
              },
            },
            { $unwind: "$song" },
          ],
          as: "playHistory",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    // Xác định các bài hát đã tương tác và trọng số
    const likedSongIds = new Set();
    const songWeights = new Map(); // Lưu trọng số cho từng bài hát
    userData.forEach((data) => {
      data.tracks.forEach((t) => {
        const songId = t.track_id.toString();
        likedSongIds.add(songId);
        songWeights.set(songId, (songWeights.get(songId) || 0) + 1); // Trọng số từ playlist
      });
      data.playHistory.forEach((ph) => {
        const songId = ph.track_id.toString();
        const playRatio = ph.play_duration / ph.song.duration;
        if (ph.completed || playRatio >= 0.5) {
          likedSongIds.add(songId);
          const score = ph.completed ? 2 : playRatio >= 0.5 ? 1.5 : 1;
          songWeights.set(songId, (songWeights.get(songId) || 0) + score);
        }
      });
      data.favorites.forEach((f) => {
        const songId = f.track_id.toString();
        likedSongIds.add(songId);
        songWeights.set(songId, (songWeights.get(songId) || 0) + 3); // Trọng số cao cho favorite
      });
    });

    // Xử lý cold-start
    if (likedSongIds.size === 0) {
      const popularSongs = await Song.find()
        .sort({ streams: -1 })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    // Truy vấn dữ liệu toàn cục để xây dựng ma trận bài hát-người dùng
    const allData = await Playlist.aggregate([
      { $match: { isPublic: true } },
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "playhistories",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
            {
              $lookup: {
                from: "songs",
                localField: "track_id",
                foreignField: "_id",
                as: "song",
              },
            },
            { $unwind: "$song" },
          ],
          as: "playHistory",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    const songUserMap = new Map();
    const allUserIds = new Set();
    allData.forEach((data) => {
      data.tracks.forEach((t) => {
        const songId = t.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        songUserMap.get(songId).set(data.userId.toString(), 1);
        allUserIds.add(data.userId.toString());
      });
      data.playHistory.forEach((ph) => {
        const songId = ph.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        const playRatio = ph.play_duration / ph.song.duration;
        const score = ph.completed
          ? 2
          : playRatio >= 0.5
          ? 1.5
          : playRatio >= 0.2
          ? 0.5
          : 0;
        if (score > 0)
          songUserMap.get(songId).set(data.userId.toString(), score);
        allUserIds.add(data.userId.toString());
      });
      data.favorites.forEach((f) => {
        const songId = f.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        songUserMap.get(songId).set(data.userId.toString(), 3); // Trọng số cao cho favorite
        allUserIds.add(data.userId.toString());
      });
    });

    const allUserIdsArray = [...allUserIds];
    const allSongIds = [...songUserMap.keys()];
    const { matrix, songIdToIdx } = buildSongUserMatrix(
      songUserMap,
      allUserIdsArray
    );

    // Tính điểm gợi ý cho các bài hát chưa nghe
    const recommendationScores = new Map();
    allSongIds.forEach((songId) => {
      if (likedSongIds.has(songId)) return; // Bỏ qua bài hát đã thích
      let totalScore = 0;
      let totalWeight = 0;
      likedSongIds.forEach((likedSongId) => {
        const songAIdx = songIdToIdx.get(likedSongId);
        const songBIdx = songIdToIdx.get(songId);
        const sim = cosineSimilaritySparse(
          matrix,
          songAIdx,
          songBIdx,
          allUserIdsArray.length
        );
        if (sim > 0) {
          totalScore += sim * (songWeights.get(likedSongId) || 1); // Nhân với trọng số
          totalWeight += sim;
        }
      });
      if (totalWeight > 0)
        recommendationScores.set(songId, totalScore / totalWeight);
    });

    // Lấy top 12 bài hát có điểm cao nhất
    const topRecommendations = Array.from(recommendationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([songId]) => songId);

    const recommendedSongs = await Song.find({
      _id: { $in: topRecommendations },
    }).lean();
    const songsWithDetails = await fetchSongDetails(recommendedSongs);

    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getItemBasedRecommendations:", error);
    next(error);
  }
};

export const getUserBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetData = await Playlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    const targetSongIds = new Set([
      ...targetData.flatMap((p) => p.tracks.map((t) => t.track_id.toString())),
      ...targetData.flatMap((p) =>
        p.favorites.map((f) => f.track_id.toString())
      ),
    ]);

    if (targetSongIds.size === 0) {
      // Xử lý cold-start ngay tại đây nếu không có dữ liệu
      const popularSongs = await Song.find({ streams: { $gt: 1000 } })
        .limit(10)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    const allUserData = await Playlist.aggregate([
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    const userSongMap = new Map();
    allUserData.forEach((playlist) => {
      const userIdStr = playlist.userId.toString();
      const songs = new Set([
        ...playlist.tracks.map((t) => t.track_id.toString()),
        ...playlist.favorites.map((f) => f.track_id.toString()),
      ]);
      userSongMap.set(userIdStr, songs);
    });

    const allSongIds = [
      ...new Set([...userSongMap.values()].flatMap((songs) => [...songs])),
    ];
    const { matrix, userIdToIdx } = buildSparseMatrix(userSongMap, allSongIds);

    const targetUserIdx = userIdToIdx.get(userId);
    const similarityScores = new Map();
    userSongMap.forEach((_, otherUserId) => {
      if (otherUserId === userId) return;
      const otherUserIdx = userIdToIdx.get(otherUserId);
      const similarity = cosineSimilaritySparse(
        matrix,
        targetUserIdx,
        otherUserIdx,
        allSongIds.length
      );
      if (similarity > 0.3) similarityScores.set(otherUserId, similarity); // Ngưỡng 0.3
    });

    const topSimilarUsers = Array.from(similarityScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([userId, similarity]) => ({ userId, similarity }));

    const recommendationScores = new Map();
    topSimilarUsers.forEach(({ userId: similarUserId, similarity }) => {
      userSongMap.get(similarUserId).forEach((songId) => {
        if (!targetSongIds.has(songId)) {
          const currentScore = recommendationScores.get(songId) || 0;
          recommendationScores.set(songId, currentScore + similarity);
        }
      });
    });

    // Kết hợp Content-based Filtering
    const targetSongs = await Song.find({
      _id: { $in: [...targetSongIds] },
    }).lean();
    const targetMoods = [...new Set(targetSongs.map((s) => s.mood))];
    const targetTempos = targetSongs
      .map((s) => s.tempo_bpm)
      .filter((t) => !isNaN(t)); // Lọc bỏ NaN nếu có
    const avgTempo =
      targetTempos.length > 0
        ? targetTempos.reduce((sum, t) => sum + t, 0) / targetTempos.length
        : 120; // Giá trị mặc định nếu không có tempo

    let contentBasedSongs = [];
    if (targetMoods.length > 0) {
      contentBasedSongs = await Song.find({
        _id: { $nin: [...targetSongIds] },
        mood: { $in: targetMoods },
        tempo_bpm: { $gte: avgTempo - 20, $lte: avgTempo + 20 },
      })
        .limit(10)
        .lean();
    } else {
      // Nếu không có mood, lấy bài hát phổ biến
      contentBasedSongs = await Song.find({
        _id: { $nin: [...targetSongIds] },
        streams: { $gt: 1000 },
      })
        .limit(10)
        .lean();
    }

    contentBasedSongs.forEach((song) => {
      recommendationScores.set(
        song._id.toString(),
        (recommendationScores.get(song._id.toString()) || 0) + 0.5
      );
    });

    const topRecommendations = Array.from(recommendationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([songId]) => songId);

    const recommendedSongs = await Song.find({
      _id: { $in: topRecommendations },
    }).lean();
    const songsWithDetails = await fetchSongDetails(recommendedSongs);

    // Xử lý Cold-start (đã xử lý ở trên, nhưng để chắc chắn)
    if (songsWithDetails.length === 0) {
      const popularSongs = await Song.find({ streams: { $gt: 1000 } })
        .limit(10)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getUserBasedRecommendations:", error);
    next(error);
  }
};

// Item-based CF
// export const getRecommendations = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     // Tương tác của người dùng
//     const userPlaylists = await Playlist.find({ userId }).lean();
//     const playlistIds = userPlaylists.map((p) => p._id);
//     const userPlaylistTracks = await PlaylistTrack.find({
//       playlist_id: { $in: playlistIds },
//     })
//       .populate("track_id", "_id")
//       .lean();
//     const userPlayHistory = await PlayHistory.find({ user_id: userId })
//       .populate("track_id", "_id duration")
//       .lean();
//     const userSkipHistory = await SkipHistory.find({ user_id: userId })
//       .populate("track_id", "_id")
//       .lean();
//     const userFavorites = await UserFavorite.find({ user_id: userId })
//       .populate("track_id", "_id")
//       .lean();

//     // Bài hát người dùng thích (tích cực)
//     const likedSongIds = new Set();
//     userPlaylistTracks.forEach((pt) => likedSongIds.add(pt.track_id._id.toString()));
//     userPlayHistory.forEach((ph) => {
//       const playRatio = ph.play_duration / ph.track_id.duration;
//       if (ph.completed || playRatio >= 0.5) {
//         likedSongIds.add(ph.track_id._id.toString());
//       }
//     });
//     userFavorites.forEach((uf) => likedSongIds.add(uf.track_id._id.toString()));

//     // Bài hát bị skip (tiêu cực)
//     const skippedSongIds = new Set(
//       userSkipHistory.map((sh) => sh.track_id._id.toString())
//     );

//     if (likedSongIds.size === 0) {
//       return res.status(200).json({ message: "No recommendations available", songs: [] });
//     }

//     // Dữ liệu tương tác
//     const allPlaylistTracks = await PlaylistTrack.find().lean();
//     const allPlayHistory = await PlayHistory.find().lean();
//     const allSkipHistory = await SkipHistory.find().lean();
//     const allFavorites = await UserFavorite.find().lean();

//     // Danh sách tất cả bài hát không trùng
//     const allSongIds = [
//       ...new Set([
//         ...allPlaylistTracks.map((pt) => pt.track_id.toString()),
//         ...allPlayHistory.map((ph) => ph.track_id.toString()),
//         ...allSkipHistory.map((sh) => sh.track_id.toString()),
//         ...allFavorites.map((uf) => uf.track_id.toString()),
//       ]),
//     ];

//     // Ma trận tương tác với trọng số
//     const songUserMap = new Map();
//     const addInteraction = (songId, userId, score) => {
//       if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
//       const userScores = songUserMap.get(songId);
//       userScores.set(userId, Math.max(userScores.get(userId) || 0, score));
//     };

//     allPlaylistTracks.forEach((pt) => {
//       const songId = pt.track_id.toString();
//       const userId = pt.playlist_id.toString();
//       addInteraction(songId, userId, 1);
//     });

//     allPlayHistory.forEach((ph) => {
//       const songId = ph.track_id.toString();
//       const userId = ph.user_id.toString();
//       const playRatio = ph.play_duration / ph.track_id.duration;
//       let score = 0;
//       if (ph.completed) score = 2;
//       else if (playRatio >= 0.5) score = 1.5;
//       else if (playRatio >= 0.2) score = 0.5;
//       if (score > 0) addInteraction(songId, userId, score);
//     });

//     allSkipHistory.forEach((sh) => {
//       const songId = sh.track_id.toString();
//       const userId = sh.user_id.toString();
//       const skipScore = sh.skip_type === "manual" ? -1 : -0.5;
//       addInteraction(songId, userId, skipScore);
//     });

//     allFavorites.forEach((uf) => {
//       const songId = uf.track_id.toString();
//       const userId = uf.user_id.toString();
//       addInteraction(songId, userId, 2);
//     });

//     // Tính độ tương đồng giữa các bài hát
//     const similarityMatrix = new Map();
//     likedSongIds.forEach((likedSongId) => {
//       const likedUsers = songUserMap.get(likedSongId) || new Map();
//       const similarities = new Map();

//       allSongIds.forEach((otherSongId) => {
//         if (likedSongId === otherSongId) return;
//         const otherUsers = songUserMap.get(otherSongId) || new Map();

//         const allUsers = [...new Set([...likedUsers.keys(), ...otherUsers.keys()])];
//         const vecA = allUsers.map((user) => likedUsers.get(user) || 0);
//         const vecB = allUsers.map((user) => otherUsers.get(user) || 0);

//         const similarity = cosineSimilarity(vecA, vecB);
//         similarities.set(otherSongId, similarity);
//       });

//       similarityMatrix.set(likedSongId, similarities);
//     });

//     // Tính điểm gợi ý cho bài hát chưa nghe
//     const recommendationScores = new Map();
//     allSongIds.forEach((songId) => {
//       if (likedSongIds.has(songId) || skippedSongIds.has(songId)) return;

//       let totalScore = 0;
//       let totalWeight = 0;
//       likedSongIds.forEach((likedSongId) => {
//         const similarity = similarityMatrix.get(likedSongId)?.get(songId) || 0;
//         if (similarity > 0) {
//           totalScore += similarity;
//           totalWeight += 1;
//         }
//       });

//       if (totalWeight > 0) {
//         recommendationScores.set(songId, totalScore / totalWeight);
//       }
//     });

//     // Sắp xếp và lấy top bài hát gợi ý
//     const topRecommendations = Array.from(recommendationScores.entries())
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 10)
//       .map(([songId]) => songId);

//     const recommendedSongs = await Song.find({ _id: { $in: topRecommendations } }).lean();

//     // Lấy thông tin bổ sung cho từng bài hát
//     const songsWithDetails = await Promise.all(
//       recommendedSongs.map(async (song) => {
//         // Lấy danh sách nghệ sĩ
//         const trackArtists = await TrackArtist.find({ track_id: song._id }).lean();
//         const artistIds = trackArtists.map((ta) => ta.artist_id);
//         const artists = await Artist.find({ _id: { $in: artistIds } })
//           .select("_id name imageUrl")
//           .lean();

//         // Lấy danh sách thể loại
//         const trackGenres = await TrackGenre.find({ track_id: song._id }).lean();
//         const genreIds = trackGenres.map((tg) => tg.genre_id);
//         const genres = await Genre.find({ _id: { $in: genreIds } })
//           .select("_id name imageUrl")
//           .lean();

//         // Lấy danh sách nhạc cụ
//         const trackInstruments = await TrackInstrument.find({ track_id: song._id }).lean();
//         const instrumentIds = trackInstruments.map((ti) => ti.instrument_id);
//         const instruments = await Instrument.find({ _id: { $in: instrumentIds } })
//           .select("_id name imageUrl")
//           .lean();

//         // Lấy album
//         const albumTrack = await AlbumTrack.findOne({ track_id: song._id }).lean();
//         let album = null;
//         if (albumTrack) {
//           album = await Album.findById(albumTrack.album_id)
//             .select("_id title imageUrl")
//             .lean();
//         }

//         return {
//           ...song,
//           artists,
//           genres,
//           instruments,
//           album,
//         };
//       })
//     );

//     res.status(200).json({
//       songs: songsWithDetails,
//     });
//   } catch (error) {
//     console.error("Error in getRecommendations:", error);
//     next(error);
//   }
// };
export const getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Truy vấn dữ liệu người dùng
    const userData = await Playlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "playhistories",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
            {
              $lookup: {
                from: "songs",
                localField: "track_id",
                foreignField: "_id",
                as: "song",
              },
            },
            { $unwind: "$song" },
          ],
          as: "playHistory",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    const likedSongIds = new Set();
    const songWeights = new Map(); // Lưu trọng số cho từng bài hát
    userData.forEach((data) => {
      data.tracks.forEach((t) => {
        const songId = t.track_id.toString();
        likedSongIds.add(songId);
        songWeights.set(songId, (songWeights.get(songId) || 0) + 1); // Trọng số từ playlist
      });
      data.playHistory.forEach((ph) => {
        const songId = ph.track_id.toString();
        const playRatio = ph.play_duration / ph.song.duration;
        if (ph.completed || playRatio >= 0.5) {
          likedSongIds.add(songId);
          const score = ph.completed ? 2 : playRatio >= 0.5 ? 1.5 : 1;
          songWeights.set(songId, (songWeights.get(songId) || 0) + score);
        }
      });
      data.favorites.forEach((f) => {
        const songId = f.track_id.toString();
        likedSongIds.add(songId);
        songWeights.set(songId, (songWeights.get(songId) || 0) + 3); // Trọng số cao cho favorite
      });
    });

    if (likedSongIds.size === 0) {
      const popularSongs = await Song.find()
        .sort({ streams: -1 })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    // Lấy thông tin Genre và Instrument từ các bài hát yêu thích
    const likedSongs = await Song.find({
      _id: { $in: [...likedSongIds] },
    }).lean();
    const trackGenres = await TrackGenre.find({
      track_id: { $in: likedSongs.map((s) => s._id) },
    }).lean();
    const trackInstruments = await TrackInstrument.find({
      track_id: { $in: likedSongs.map((s) => s._id) },
    }).lean();
    const likedGenreIds = [
      ...new Set(trackGenres.map((tg) => tg.genre_id.toString())),
    ];
    const likedInstrumentIds = [
      ...new Set(trackInstruments.map((ti) => ti.instrument_id.toString())),
    ];

    // Truy vấn dữ liệu toàn cục
    const allData = await Playlist.aggregate([
      { $match: { isPublic: true } },
      {
        $lookup: {
          from: "playlisttracks",
          localField: "_id",
          foreignField: "playlist_id",
          as: "tracks",
        },
      },
      {
        $lookup: {
          from: "playhistories",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
            {
              $lookup: {
                from: "songs",
                localField: "track_id",
                foreignField: "_id",
                as: "song",
              },
            },
            { $unwind: "$song" },
          ],
          as: "playHistory",
        },
      },
      {
        $lookup: {
          from: "userfavorites",
          localField: "userId",
          foreignField: "user_id",
          as: "favorites",
        },
      },
    ]);

    const songUserMap = new Map();
    const allUserIds = new Set();
    allData.forEach((data) => {
      data.tracks.forEach((t) => {
        const songId = t.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        songUserMap.get(songId).set(data.userId.toString(), 1);
        allUserIds.add(data.userId.toString());
      });
      data.playHistory.forEach((ph) => {
        const songId = ph.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        const playRatio = ph.play_duration / ph.song.duration;
        const score = ph.completed
          ? 2
          : playRatio >= 0.5
          ? 1.5
          : playRatio >= 0.2
          ? 0.5
          : 0;
        if (score > 0)
          songUserMap.get(songId).set(data.userId.toString(), score);
        allUserIds.add(data.userId.toString());
      });
      data.favorites.forEach((f) => {
        const songId = f.track_id.toString();
        if (!songUserMap.has(songId)) songUserMap.set(songId, new Map());
        songUserMap.get(songId).set(data.userId.toString(), 3); // Trọng số cao cho favorite
        allUserIds.add(data.userId.toString());
      });
    });

    const allUserIdsArray = [...allUserIds];
    const allSongIds = [...songUserMap.keys()];
    const { matrix, songIdToIdx } = buildSongUserMatrix(
      songUserMap,
      allUserIdsArray
    );

    const recommendationScores = new Map();
    allSongIds.forEach((songId) => {
      if (likedSongIds.has(songId)) return; // Bỏ qua bài hát đã thích
      let totalScore = 0;
      let totalWeight = 0;
      likedSongIds.forEach((likedSongId) => {
        const songAIdx = songIdToIdx.get(likedSongId);
        const songBIdx = songIdToIdx.get(songId);
        const sim = cosineSimilaritySparse(
          matrix,
          songAIdx,
          songBIdx,
          allUserIdsArray.length
        );
        if (sim > 0) {
          totalScore += sim * (songWeights.get(likedSongId) || 1); // Nhân với trọng số
          totalWeight += 1;
        }
      });
      if (totalWeight > 0)
        recommendationScores.set(songId, totalScore / totalWeight);
    });

    // Kết hợp Content-based Filtering dựa trên Genre và Instrument
    const contentBasedSongs = await Song.aggregate([
      {
        $lookup: {
          from: "track_genres",
          localField: "_id",
          foreignField: "track_id",
          as: "genres",
        },
      },
      {
        $lookup: {
          from: "track_instruments",
          localField: "_id",
          foreignField: "track_id",
          as: "instruments",
        },
      },
      {
        $match: {
          _id: {
            $nin: [...likedSongIds].map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          },
          $or: [
            {
              "genres.genre_id": {
                $in: likedGenreIds.map((id) => new mongoose.Types.ObjectId(id)),
              },
            },
            {
              "instruments.instrument_id": {
                $in: likedInstrumentIds.map(
                  (id) => new mongoose.Types.ObjectId(id)
                ),
              },
            },
          ],
        },
      },
      { $limit: 20 },
    ]);

    contentBasedSongs.forEach((song) => {
      const songId = song._id.toString();
      recommendationScores.set(
        songId,
        (recommendationScores.get(songId) || 0) + 1
      ); // Thêm điểm từ content-based
    });

    const topRecommendations = Array.from(recommendationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Tăng số lượng gợi ý
      .map(([songId]) => songId);

    const recommendedSongs = await Song.find({
      _id: { $in: topRecommendations },
    }).lean();
    const songsWithDetails = await fetchSongDetails(recommendedSongs);

    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    next(error);
  }
};

export const getKnowledgeBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { mood, tempo, genre, instrument } = req.query; // Nhận tiêu chí từ query params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const query = {};
    if (mood) query.mood = mood;
    if (tempo)
      query.tempo_bpm = { $gte: Number(tempo) - 20, $lte: Number(tempo) + 20 };

    let songIds = [];
    if (genre || instrument) {
      const genreIds = genre
        ? await Genre.find({ name: genre }).distinct("_id")
        : [];
      const instrumentIds = instrument
        ? await Instrument.find({ name: instrument }).distinct("_id")
        : [];
      const trackGenres = await TrackGenre.find({
        genre_id: { $in: genreIds },
      }).distinct("track_id");
      const trackInstruments = await TrackInstrument.find({
        instrument_id: { $in: instrumentIds },
      }).distinct("track_id");
      songIds = [...new Set([...trackGenres, ...trackInstruments])];
      query._id = { $in: songIds };
    }

    const songs = await Song.find(query).limit(12).lean();
    const songsWithDetails = await fetchSongDetails(songs);

    if (songsWithDetails.length === 0) {
      const popularSongs = await Song.find({ streams: { $gt: 1000 } })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getKnowledgeBasedRecommendations:", error);
    next(error);
  }
};
export const getUtilityBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { mood, tempo } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Build query to reduce dataset
    const query = {};
    if (mood) query.mood = mood;
    if (tempo) {
      query.tempo_bpm = {
        $gte: Number(tempo) - 20,
        $lte: Number(tempo) + 20,
      };
    }

    // Utility scoring function
    const utilityScore = (song) => {
      let score = 0;
      if (mood && song.mood === mood) score += 50;
      if (tempo && Math.abs(song.tempo_bpm - Number(tempo)) < 20) score += 30;
      score += (song.average_rating || 0) * 10; // Handle missing ratings
      score += (song.streams || 0) / 1000; // Handle missing streams
      return score;
    };

    // Fetch songs with filters and limit early
    const songs = await Song.find(query)
      .limit(100) // Limit to avoid fetching too many documents
      .lean()
      .exec(); // Ensure query execution

    if (!songs || songs.length === 0) {
      // Fallback to popular songs
      const popularSongs = await Song.find()
        .sort({ streams: -1 })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    const scoredSongs = songs
      .map((song) => ({ song, score: utilityScore(song) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.song);

    // Fetch details for top songs
    const songsWithDetails = await fetchSongDetails(scoredSongs);
    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getUtilityBasedRecommendations:", error);
    next(error);
  }
};
export const getDemographicBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const artists = await Artist.find({ country: "Vietnam" }).lean(); // Giả sử ưu tiên Vietnam
    const artistIds = artists.map((a) => a._id);
    const trackArtists = await TrackArtist.find({
      artist_id: { $in: artistIds },
    }).lean();
    const songIds = trackArtists.map((ta) => ta.track_id);

    const songs = await Song.find({ _id: { $in: songIds } })
      .limit(12)
      .lean();
    const songsWithDetails = await fetchSongDetails(songs);

    if (songsWithDetails.length === 0) {
      const popularSongs = await Song.find({ streams: { $gt: 20000 } })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getDemographicBasedRecommendations:", error);
    next(error);
  }
};

export const getContentBasedRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const playHistory = await PlayHistory.find({ user_id: userId })
      .sort({ played_at: -1 })
      .limit(12)
      .populate("track_id")
      .lean();
    const favorites = await UserFavorite.find({ user_id: userId }).lean();
    const likedSongIds = [
      ...playHistory.map((ph) => ph.track_id._id.toString()),
      ...favorites.map((f) => f.track_id.toString()),
    ];

    if (likedSongIds.length === 0) {
      const popularSongs = await Song.find({ streams: { $gt: 1000 } })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    const likedSongs = await Song.find({ _id: { $in: likedSongIds } }).lean();
    const moods = [...new Set(likedSongs.map((s) => s.mood))];
    const tempos = likedSongs.map((s) => s.tempo_bpm).filter((t) => !isNaN(t));
    const avgTempo =
      tempos.length > 0
        ? tempos.reduce((sum, t) => sum + t, 0) / tempos.length
        : 120;

    const recommendations = await Song.find({
      _id: { $nin: likedSongIds },
      mood: { $in: moods },
      tempo_bpm: { $gte: avgTempo - 20, $lte: avgTempo + 20 },
    })
      .limit(12)
      .lean();

    const songsWithDetails = await fetchSongDetails(recommendations);
    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getContentBasedRecommendations:", error);
    next(error);
  }
};

export const getUserToUserCollaborativeRecommendations = async (
  req,
  res,
  next
) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetHistory = await PlayHistory.find({ user_id: userId }).lean();
    const targetSongIds = new Set(
      targetHistory.map((h) => h.track_id.toString())
    );

    if (targetSongIds.size === 0) {
      const popularSongs = await Song.find({ streams: { $gt: 1000 } })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    const allHistory = await PlayHistory.find({
      user_id: { $ne: userId },
    }).lean();
    const userSongMap = new Map();
    allHistory.forEach((h) => {
      const userIdStr = h.user_id.toString();
      if (!userSongMap.has(userIdStr)) userSongMap.set(userIdStr, new Set());
      userSongMap.get(userIdStr).add(h.track_id.toString());
    });

    const allSongIds = [
      ...new Set([...userSongMap.values()].flatMap((songs) => [...songs])),
    ];
    const { matrix, userIdToIdx } = buildSparseMatrix(userSongMap, allSongIds);

    const targetIdx = userIdToIdx.get(userId) || -1;
    const similarityScores = new Map();
    userSongMap.forEach((_, otherUserId) => {
      const otherIdx = userIdToIdx.get(otherUserId);
      const similarity = cosineSimilaritySparse(
        matrix,
        targetIdx,
        otherIdx,
        allSongIds.length
      );
      if (similarity > 0.3) similarityScores.set(otherUserId, similarity);
    });

    const topSimilarUsers = [...similarityScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([uid]) => uid);

    const recommendationScores = new Map();
    topSimilarUsers.forEach((similarUserId) => {
      userSongMap.get(similarUserId).forEach((songId) => {
        if (!targetSongIds.has(songId)) {
          recommendationScores.set(
            songId,
            (recommendationScores.get(songId) || 0) + 1
          );
        }
      });
    });

    const topSongIds = [...recommendationScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([songId]) => songId);

    const songs = await Song.find({ _id: { $in: topSongIds } }).lean();
    const songsWithDetails = await fetchSongDetails(songs);
    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getUserToUserCollaborativeRecommendations:", error);
    next(error);
  }
};

export const getHybridRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Content-based
    const playHistory = await PlayHistory.find({ user_id: userId })
      .populate("track_id")
      .lean();
    const likedSongIds = playHistory.map((ph) => ph.track_id._id.toString());
    const likedSongs = await Song.find({ _id: { $in: likedSongIds } }).lean();
    const moods = [...new Set(likedSongs.map((s) => s.mood))];
    const avgTempo =
      likedSongs.reduce((sum, s) => sum + s.tempo_bpm, 0) / likedSongs.length ||
      120;

    const contentBasedSongs = await Song.find({
      _id: { $nin: likedSongIds },
      mood: { $in: moods },
      tempo_bpm: { $gte: avgTempo - 20, $lte: avgTempo + 20 },
    })
      .limit(12)
      .lean();

    // Collaborative Filtering
    const allHistory = await PlayHistory.find({
      user_id: { $ne: userId },
    }).lean();
    const userSongMap = new Map();
    allHistory.forEach((h) => {
      const userIdStr = h.user_id.toString();
      if (!userSongMap.has(userIdStr)) userSongMap.set(userIdStr, new Set());
      userSongMap.get(userIdStr).add(h.track_id.toString());
    });

    const allSongIds = [
      ...new Set([...userSongMap.values()].flatMap((songs) => [...songs])),
    ];
    const { matrix, userIdToIdx } = buildSparseMatrix(userSongMap, allSongIds);
    const targetIdx = userIdToIdx.get(userId) || -1;

    const similarityScores = new Map();
    userSongMap.forEach((_, otherUserId) => {
      const otherIdx = userIdToIdx.get(otherUserId);
      const similarity = cosineSimilaritySparse(
        matrix,
        targetIdx,
        otherIdx,
        allSongIds.length
      );
      if (similarity > 0.3) similarityScores.set(otherUserId, similarity);
    });

    const topSimilarUsers = [...similarityScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([uid]) => uid);

    const collabScores = new Map();
    topSimilarUsers.forEach((similarUserId) => {
      userSongMap.get(similarUserId).forEach((songId) => {
        if (!likedSongIds.includes(songId)) {
          collabScores.set(songId, (collabScores.get(songId) || 0) + 1);
        }
      });
    });

    // Kết hợp
    const combinedScores = new Map();
    contentBasedSongs.forEach((song) =>
      combinedScores.set(song._id.toString(), 1)
    );
    collabScores.forEach((score, songId) => {
      combinedScores.set(songId, (combinedScores.get(songId) || 0) + score);
    });

    const topSongIds = [...combinedScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([songId]) => songId);

    const songs = await Song.find({ _id: { $in: topSongIds } }).lean();
    const songsWithDetails = await fetchSongDetails(songs);
    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getHybridRecommendations:", error);
    next(error);
  }
};

export const getMatrixFactorizationRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userHistory = await PlayHistory.find({ user_id: userId }).lean();
    const likedSongIds = new Set(userHistory.map((h) => h.track_id.toString()));

    if (likedSongIds.size === 0) {
      const popularSongs = await Song.find()
        .sort({ streams: -1 })
        .limit(12)
        .lean();
      const popularSongsWithDetails = await fetchSongDetails(popularSongs);
      return res.status(200).json({ songs: popularSongsWithDetails });
    }

    const allHistory = await PlayHistory.find().lean();
    const songUserMap = new Map();
    allHistory.forEach((h) => {
      const songId = h.track_id.toString();
      if (!songUserMap.has(songId)) songUserMap.set(songId, new Set());
      songUserMap.get(songId).add(h.user_id.toString());
    });

    const allUserIds = [
      ...new Set(allHistory.map((h) => h.user_id.toString())),
    ];
    const allSongIds = [...songUserMap.keys()];
    const { matrix, songIdToIdx } = buildSongUserMatrix(
      songUserMap,
      allUserIds.map((id) => ({ userId: id, score: 1 }))
    );

    const recommendationScores = new Map();
    allSongIds.forEach((songId) => {
      if (likedSongIds.has(songId)) return;
      let totalScore = 0;
      likedSongIds.forEach((likedSongId) => {
        const songAIdx = songIdToIdx.get(likedSongId);
        const songBIdx = songIdToIdx.get(songId);
        const sim = cosineSimilaritySparse(
          matrix,
          songAIdx,
          songBIdx,
          allUserIds.length
        );
        if (sim > 0) totalScore += sim;
      });
      if (totalScore > 0) recommendationScores.set(songId, totalScore);
    });

    const topSongIds = [...recommendationScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([songId]) => songId);

    const songs = await Song.find({ _id: { $in: topSongIds } }).lean();
    const songsWithDetails = await fetchSongDetails(songs);
    res.status(200).json({ songs: songsWithDetails });
  } catch (error) {
    console.error("Error in getMatrixFactorizationRecommendations:", error);
    next(error);
  }
};
