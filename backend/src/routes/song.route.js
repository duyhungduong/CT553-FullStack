import { Router } from "express";
import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getAllSongs,
  getFeaturedSongs,
  getMadeForYouSongs,
  getPlaylistById,
  getSongById,
  getTrendingSongs,
  increaseSongStreams,
  removeTrackFromPlaylist,
  updatePlaylist,
  createPlayHistory,
  getPlayHistoryByUser,
  deletePlayHistory,
  createSkipHistory,
  getSkipHistoryByUser,
  deleteSkipHistory,
  addSongToFavorites,
  removeSongFromFavorites,
  getUserFavorites,
  analyzeMoodController,
  getRelatedSongs,
  getRecentSongs,
  getSongsByGenre,
  getRandomSongs,
  getSongsByArtist,
  searchSongs
} from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import multer from "multer";


const upload = multer({ dest: "uploads/" });
const router = Router();

router.get("/", getAllSongs);
router.get("/search", searchSongs);
router.get("/:artistId/song-by-artist", getSongsByArtist);
router.get("/radom", getRandomSongs);
router.get("/:genreId/song-by-genre", getSongsByGenre);
router.get("/recent-song", getRecentSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/:songId", getSongById);
router.post("/:songId/stream", increaseSongStreams);

// analyze-mood
router.post(
  "/analyze-mood",
  upload.single("audio"),
  analyzeMoodController
);

// Playlist routes
router.post("/playlists", createPlaylist);
router.get("/playlists/all", getAllPlaylists);
router.get("/playlists/:id", getPlaylistById);
router.put("/playlists/:id", updatePlaylist);
router.delete("/playlists/:id", deletePlaylist);
router.post("/playlists/add-track", addTrackToPlaylist);
router.post("/playlists/remove-track", removeTrackFromPlaylist);

//Review Route
// router.post("/reviews", createReview);
// router.get("/reviews", getAllReviews);
// router.get("/reviews/:id", getReviewById);
// router.put("/reviews/:id", updateReview);
// router.delete("/reviews/:id", deleteReview);

// PlayHistory routes
router.post("/play-history", createPlayHistory);
router.get("/play-history/:userId", getPlayHistoryByUser);
router.delete("/play-history/:id", deletePlayHistory);

// SkipHistory routes
router.post("/skip-history", createSkipHistory);
router.get("/skip-history/:userId", getSkipHistoryByUser);
router.delete("/skip-history/:id", deleteSkipHistory);

// New favorite routes (protected by auth)
router.post("/favorites/add", protectRoute, addSongToFavorites);
router.post("/favorites/remove", protectRoute, removeSongFromFavorites);
router.get("/favorites/:userId", protectRoute, getUserFavorites);

router.get("/:songId/related", getRelatedSongs);

export default router;
