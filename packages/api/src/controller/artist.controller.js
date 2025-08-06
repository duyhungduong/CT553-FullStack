import mongoose from "mongoose";
import { Artist } from "../models/artist.model.js";// Giả định đường dẫn tới model Artist
import { TrackArtist } from "../models/trackArtist.model.js";// Giả định đường dẫn tới model TrackArtist

export const getAllArtist = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Đếm tổng số nghệ sĩ để tính totalPages
    const total = await Artist.countDocuments();

    // Sử dụng aggregate để lấy danh sách nghệ sĩ cùng với bài hát
    const artists = await Artist.aggregate([
      // Join với TrackArtist để lấy các track_id liên quan đến artist_id
      {
        $lookup: {
          from: "track_artists", // Tên collection của TrackArtist
          localField: "_id",
          foreignField: "artist_id",
          as: "trackRelations",
        },
      },
    
      // Join với Song để lấy thông tin bài hát từ track_id
      {
        $lookup: {
          from: "songs", // Tên collection của Song
          localField: "trackRelations.track_id",
          foreignField: "_id",
          as: "songs",
        },
      },
    
      // Thêm trường songCount để tính số lượng bài hát
      {
        $addFields: {
          songCount: { $size: "$songs" }, // Đếm số lượng bài hát
        },
      },
    
      // Sắp xếp theo songCount (giảm dần)
      {
        $sort: {
          songCount: -1, // -1 để sắp xếp giảm dần, 1 để tăng dần
          name: 1,
        },
      },
    
      // Phân trang
      { $skip: skip },
      { $limit: limit },
    
      // Chỉ lấy các trường cần thiết từ Artist và Song
      {
        $project: {
          _id: 1,
          name: 1,
          bio: 1,
          imageUrl: 1,
          country: 1,
          website: 1,
          joined_date: 1,
          is_verified: 1,
          createdAt: 1,
          updatedAt: 1,
          songs: {
            $map: {
              input: "$songs",
              as: "song",
              in: {
                _id: "$$song._id",
                title: "$$song.title",
                imageUrl: "$$song.imageUrl",
                duration: "$$song.duration",
              },
            },
          },
          songCount: 1, // Có thể giữ lại songCount nếu muốn trả về số lượng bài hát
        },
      },
    ]);

    // Trả về phản hồi với phân trang
    res.status(200).json({
      artists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllArtist:", error);
    next(error);
  }
};

export const getArtistById = async (req, res, next) => {
  try {
    const { artistId } = req.params;

    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    res.status(200).json(artist);
  } catch (error) {
    next(error);
  }
};
