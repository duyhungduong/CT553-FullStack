import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    favoriteSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song",
      },
    ],
    favoriteAlbums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "album",
      },
    ],
    playlists: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "song" }],
      },
    ],
  },
  { timestamps: true }
);

export const Library = mongoose.model("library", librarySchema);
