import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { Genre } from "../models/genre.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import { Instrument } from "../models/instrument.model.js";
import PlayHistory from "../models/PlayHistory.model.js"; 
import { UserFavorite } from "../models/userfavorite.model.js";
export const getChartData = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - (groupBy === "month" ? 6 : 3)));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const streamData = await PlayHistory.aggregate([
      { $match: { played_at: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: "$played_at" } }, streams: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", streams: 1, _id: 0 } },
    ]);

    const likeData = await UserFavorite.aggregate([
      { $match: { favorited_at: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: "$favorited_at" } }, likes: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", likes: 1, _id: 0 } },
    ]);

    const allPeriods = [];
    if (groupBy === "month") {
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        allPeriods.push(new Date(d).toISOString().slice(0, 7));
      }
    } else {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        allPeriods.push(new Date(d).toISOString().split("T")[0]);
      }
    }

    const chartData = allPeriods.map((period) => {
      const streamEntry = streamData.find((item) => item.date === period);
      const likeEntry = likeData.find((item) => item.date === period);
      return {
        [groupBy === "month" ? "month" : "date"]:
          groupBy === "month"
            ? new Date(period + "-01").toLocaleString("en-US", { month: "short", year: "2-digit" })
            : period,
        streams: streamEntry ? streamEntry.streams : 0,
        likes: likeEntry ? likeEntry.likes : 0,
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error in getChartData:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPieChartData = async (req, res) => {
  try {
    // Lấy 6 tháng gần nhất
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setMonth(end.getMonth() - 6);

    const dateFormat = "%Y-%m";

    // Lấy dữ liệu streams từ PlayHistory
    const streamData = await PlayHistory.aggregate([
      { $match: { played_at: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$played_at" } },
          streams: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", streams: 1, _id: 0 } },
    ]);

    // Lấy dữ liệu likes từ UserFavorite
    const likeData = await UserFavorite.aggregate([
      { $match: { favorited_at: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$favorited_at" } },
          likes: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", likes: 1, _id: 0 } },
    ]);

    // Danh sách các tháng và màu sắc tương ứng
    const months = [
      { key: "october", color: "var(--color-october)" },
      { key: "november", color: "var(--color-november)" },
      { key: "december", color: "var(--color-december)" },
      { key: "january", color: "var(--color-january)" },
      { key: "february", color: "var(--color-february)" },
      { key: "march", color: "var(--color-march)" },
    ];

    // Tạo dữ liệu cho streams
    const streamsData = months.map((month, index) => {
      const monthDate = new Date(start);
      monthDate.setMonth(start.getMonth() + index);
      const monthStr = monthDate.toISOString().slice(0, 7); // YYYY-MM
      const streamEntry = streamData.find((item) => item.month === monthStr);
      return {
        month: month.key,
        streams: streamEntry ? streamEntry.streams : 0,
        fill: month.color,
      };
    });

    // Tạo dữ liệu cho likes
    const likesData = months.map((month, index) => {
      const monthDate = new Date(start);
      monthDate.setMonth(start.getMonth() + index);
      const monthStr = monthDate.toISOString().slice(0, 7); // YYYY-MM
      const likeEntry = likeData.find((item) => item.month === monthStr);
      return {
        month: month.key,
        likes: likeEntry ? likeEntry.likes : 0,
        fill: month.color,
      };
    });

    res.json({ streamsData, likesData });
  } catch (error) {
    console.error("Error in getPieChartData:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRadarChartData = async (req, res) => {
  try {
    // Luôn lấy dữ liệu cho 6 tháng gần nhất
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setMonth(end.getMonth() - 6);

    // Định dạng nhóm theo tháng
    const dateFormat = "%Y-%m";

    // Lấy dữ liệu streams từ PlayHistory
    const streamData = await PlayHistory.aggregate([
      { $match: { played_at: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$played_at" } },
          streams: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", streams: 1, _id: 0 } },
    ]);

    // Lấy dữ liệu likes từ UserFavorite
    const likeData = await UserFavorite.aggregate([
      { $match: { favorited_at: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$favorited_at" } },
          likes: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", likes: 1, _id: 0 } },
    ]);

    // Tạo danh sách tất cả các tháng trong khoảng thời gian
    const allMonths = [];
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      allMonths.push(new Date(d).toISOString().slice(0, 7)); // YYYY-MM
    }

    // Định dạng dữ liệu trả về
    const chartData = allMonths.map((month) => {
      const streamEntry = streamData.find((item) => item.month === month);
      const likeEntry = likeData.find((item) => item.month === month);
      return {
        month: new Date(month + "-01").toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        streams: streamEntry ? streamEntry.streams : 0,
        likes: likeEntry ? likeEntry.likes : 0,
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error in getRadarChartData:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStats = async (req, res, next) => {
  try {
    const [
      totalSongs,
      totalAlbums,
      totalUsers,
      uniqueArtists,
      totalGenres,
      totalInstruments,
    ] = await Promise.all([
      Song.countDocuments(),
      Album.countDocuments({ total_tracks: { $gt: 1 } }),
      User.countDocuments(),
      Artist.countDocuments(),
      Genre.countDocuments(),
      Instrument.countDocuments(),
    ]);

    res.status(200).json({
      totalAlbums,
      totalSongs,
      totalUsers,
      totalArtists: uniqueArtists || 0,
      totalGenres,
      totalInstruments,
    });
  } catch (error) {
    next(error);
  }
};
