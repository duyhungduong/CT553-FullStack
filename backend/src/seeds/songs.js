import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { config } from "dotenv";

config();

// Data for seeding
const songs = [
  {
    title: "Stay With Me",
    artist: "Sarah Mitchell",
    genre: ["Acoustic", "Piano"],
    releaseYear: 2023,
    imageUrl: "/cover-images/1.jpg",
    audioUrl: "/songs/1.mp3",
    duration: 46,
    albumId: null,
    likes: 125,
    streams: 3000,
    isFeatured: false,
  },
  {
    title: "Midnight Drive",
    artist: "The Wanderers",
    genre: ["Electronic", "Chillout"],
    releaseYear: 2022,
    imageUrl: "/cover-images/2.jpg",
    audioUrl: "/songs/2.mp3",
    duration: 41,
    albumId: "64fe5d7e6df7a2e6c1e12345", // Replace with real album ID if available
    likes: 230,
    streams: 5000,
    isFeatured: true,
  },
  {
    title: "Lost in Tokyo",
    artist: "Electric Dreams",
    genre: ["Ambient", "Cinematic"],
    releaseYear: 2021,
    imageUrl: "/cover-images/3.jpg",
    audioUrl: "/songs/3.mp3",
    duration: 24,
    albumId: null,
    likes: 310,
    streams: 7000,
    isFeatured: true,
  },
  {
    title: "Summer Daze",
    artist: "Coastal Kids",
    genre: ["Lo-fi", "Acoustic"],
    releaseYear: 2023,
    imageUrl: "/cover-images/4.jpg",
    audioUrl: "/songs/4.mp3",
    duration: 24,
    albumId: null,
    likes: 150,
    streams: 4000,
    isFeatured: false,
  },
  {
    title: "Neon Lights",
    artist: "Night Runners",
    genre: ["Electronic", "New Age"],
    releaseYear: 2022,
    imageUrl: "/cover-images/5.jpg",
    audioUrl: "/songs/5.mp3",
    duration: 36,
    albumId: null,
    likes: 180,
    streams: 4500,
    isFeatured: false,
  },
];

const seedSongs = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing songs
    console.log("Clearing existing songs...");
    const deletedCount = await Song.deleteMany({});
    console.log(`Deleted ${deletedCount.deletedCount} songs.`);

    // Insert new songs
    console.log("Inserting new songs...");
    const insertedSongs = await Song.insertMany(songs);
    console.log(`Inserted ${insertedSongs.length} songs successfully!`);
  } catch (error) {
    console.error("Error seeding songs:", error);
  } finally {
    console.log("Closing database connection...");
    mongoose.connection.close();
  }
};

seedSongs();
