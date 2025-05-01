import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { AlbumTrack } from "../models/albumTrack.model.js";
import { Song } from "../models/song.model.js";
import { TrackArtist } from "../models/trackArtist.model.js";
import { TrackGenre } from "../models/trackGenre.model.js";
import { Genre } from "../models/genre.model.js";
import { TrackInstrument } from "../models/trackInstrument.model.js";
import { Instrument } from "../models/instrument.model.js";
import mongoose from "mongoose";

export const getRelatedAlbums = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 6;

    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({ message: "Invalid album ID" });
    }
    const albumObjectId = new mongoose.Types.ObjectId(albumId);

    // 
    const currentAlbum = await Album.findById(albumObjectId).lean();
    if (!currentAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    // 
    const albumTracks = await AlbumTrack.find({
      album_id: albumObjectId,
    }).lean();
    const trackIds = albumTracks.map((at) => at.track_id);
    if (!trackIds.length) {
      return res.status(200).json({ relatedAlbums: [] });
    }

    // 
    const [trackArtists, trackGenres, trackInstruments] = await Promise.all([
      TrackArtist.find({ track_id: { $in: trackIds } }).lean(),
      TrackGenre.find({ track_id: { $in: trackIds } }).lean(),
      TrackInstrument.find({ track_id: { $in: trackIds } }).lean(),
    ]);

    const artistIds = [...new Set(trackArtists.map((ta) => ta.artist_id))];
    const genreIds = [...new Set(trackGenres.map((tg) => tg.genre_id))];
    const instrumentIds = [
      ...new Set(trackInstruments.map((ti) => ti.instrument_id)),
    ];

    // 
    const relatedAlbums = await Album.aggregate([
      // 
      {
        $lookup: {
          from: "album_tracks",
          localField: "_id",
          foreignField: "album_id",
          as: "albumTracks",
        },
      },
      {
        $lookup: {
          from: "track_artists",
          localField: "albumTracks.track_id",
          foreignField: "track_id",
          as: "trackArtists",
        },
      },
      {
        $lookup: {
          from: "track_genres",
          localField: "albumTracks.track_id",
          foreignField: "track_id",
          as: "trackGenres",
        },
      },
      {
        $lookup: {
          from: "track_instruments",
          localField: "albumTracks.track_id",
          foreignField: "track_id",
          as: "trackInstruments",
        },
      },
      // 
      { $match: { _id: { $ne: albumObjectId } } },
      // 
      {
        $addFields: {
          similarityScore: {
            $sum: [
              // 
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
              // 
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
              // 
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
                  0.15,
                  0,
                ],
              },
              // 
              {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$releaseYear", currentAlbum.releaseYear - 2] },
                      { $lte: ["$releaseYear", currentAlbum.releaseYear + 2] },
                    ],
                  },
                  0.15,
                  0,
                ],
              },
            ],
          },
        },
      },
      // 
      { $match: { similarityScore: { $gt: 0 } } },
      // 
      { $sort: { similarityScore: -1 } },
      // 
      { $limit: limit },
      // 
      {
        $lookup: {
          from: "artists",
          localField: "trackArtists.artist_id",
          foreignField: "_id",
          as: "artists",
        },
      },
      // 
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          releaseYear: 1,
          description: 1,
          total_tracks: 1,
          total_duration: 1,
          similarityScore: 1, // 
          artist: {
            $arrayElemAt: [
              {
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
              0, // 
            ],
          },
        },
      },
    ]);

    // 
    if (relatedAlbums.length < limit) {
      const additionalAlbums = await Album.aggregate([
        {
          $match: {
            _id: { $ne: albumObjectId, $nin: relatedAlbums.map((a) => a._id) },
          },
        },
        { $sort: { streams: -1 } }, // 
        { $limit: limit - relatedAlbums.length },
        {
          $project: {
            _id: 1,
            title: 1,
            imageUrl: 1,
            releaseYear: 1,
            description: 1,
            total_tracks: 1,
            total_duration: 1,
          },
        },
      ]);
      relatedAlbums.push(...additionalAlbums);
    }

    res.status(200).json({ relatedAlbums });
  } catch (error) {
    console.error("Error in getRelatedAlbums:", error);
    next(error);
  }
};

export const getAllAlbums = async (req, res, next) => {
  try {
    // Lấy tham số phân trang từ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Đếm tổng số album có total_tracks > 1
    const total = await Album.countDocuments({ total_tracks: { $gt: 1 } });

    // Lấy danh sách album với điều kiện total_tracks > 1 và phân trang
    const albums = await Album.find({ total_tracks: { $gt: 1 } })
      .select(
        "_id title imageUrl description releaseYear total_tracks total_duration isFeatured"
      )
      .skip(skip)
      .limit(limit)
      .lean();

    if (albums.length === 0) {
      return res.status(200).json({
        albums: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Lấy danh sách bài hát thuộc album
    const albumIds = albums.map((album) => album._id);
    const albumTracks = await AlbumTrack.find({ album_id: { $in: albumIds } })
      .sort({ track_number: 1 }) // Sắp xếp để lấy track đầu tiên
      .lean();

    // Gán nghệ sĩ đầu tiên vào từng album
    await Promise.all(
      albums.map(async (album) => {
        // Tìm track đầu tiên của album
        const firstTrack = albumTracks.find(
          (at) => at.album_id.toString() === album._id.toString()
        );
        if (!firstTrack) return;

        // Tìm nghệ sĩ của track đầu tiên
        const firstTrackArtist = await TrackArtist.findOne({
          track_id: firstTrack.track_id,
        }).lean();
        if (!firstTrackArtist) return;

        // Lấy thông tin nghệ sĩ
        const artist = await Artist.findById(firstTrackArtist.artist_id)
          .select("_id name imageUrl")
          .lean();

        album.artist = artist || null; // Gán nghệ sĩ vào album
      })
    );

    // Trả về phản hồi với phân trang
    res.status(200).json({
      albums,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllAlbums:", error);
    next(error);
  }
};

export const getAlbumById = async (req, res, next) => {
  try {
    const { albumId } = req.params;

    const album = await Album.findById(albumId)
      .select(
        "_id title imageUrl releaseYear description total_tracks total_duration"
      )
      .lean();
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const albumTracks = await AlbumTrack.find({ album_id: albumId }).lean();
    const trackIds = albumTracks.map((at) => at.track_id);
    if (!trackIds.length) {
      return res.status(200).json({ ...album, tracks: [], artist: null });
    }

    const [songs, trackArtists, trackGenres, trackInstruments] =
      await Promise.all([
        Song.find({ _id: { $in: trackIds } })
          .select("_id title duration imageUrl audioUrl streams")
          .lean(),
        TrackArtist.find({ track_id: { $in: trackIds } }).lean(),
        TrackGenre.find({ track_id: { $in: trackIds } }).lean(),
        TrackInstrument.find({ track_id: { $in: trackIds } }).lean(),
      ]);

    const artistIds = [...new Set(trackArtists.map((ta) => ta.artist_id))];
    const genreIds = [...new Set(trackGenres.map((tg) => tg.genre_id))];
    const instrumentIds = [
      ...new Set(trackInstruments.map((ti) => ti.instrument_id)),
    ];

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

    const enrichedSongs = songs.map((song) => ({
      ...song,
      artists: artists.filter((artist) =>
        trackArtists.some(
          (ta) =>
            ta.track_id.equals(song._id) && ta.artist_id.equals(artist._id)
        )
      ),
      genres: genres.filter((genre) =>
        trackGenres.some(
          (tg) => tg.track_id.equals(song._id) && tg.genre_id.equals(genre._id)
        )
      ),
      instruments: instruments.filter((instrument) =>
        trackInstruments.some(
          (ti) =>
            ti.track_id.equals(song._id) &&
            ti.instrument_id.equals(instrument._id)
        )
      ),
    }));

    // Assume the first song's main artist is the album's artist
    const mainArtist = trackArtists.find(
      (ta) =>
        ta.role === "MAIN_ARTIST" &&
        trackIds.some((id) => id.equals(ta.track_id))
    );
    const albumArtist = mainArtist
      ? artists.find((a) => a._id.equals(mainArtist.artist_id))
      : null;

    res
      .status(200)
      .json({ ...album, tracks: enrichedSongs, genres, artist: albumArtist });
  } catch (error) {
    next(error);
  }
};
