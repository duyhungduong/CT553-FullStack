import mongoose from "mongoose";
import { Artist } from "../models/artist.model.js";
import { config } from "dotenv";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";


config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Album.deleteMany({});
    await Song.deleteMany({});

    // Fetch existing artists
    const artists = await Artist.find({});
    if (artists.length === 0) {
      throw new Error("No artists found. Please seed artists first.");
    }

    // Create songs with artist references
    const songs = [
      {
        title: "City Rain",
        artist: artists.find((a) => a.name === "Urban Echo")._id,
        genre: ["Ambient", "Nature Sounds"],
        imageUrl: "/cover-images/7.jpg",
        audioUrl: "/songs/7.mp3",
        duration: 39,
        releaseYear: 2023,
      },
      {
        title: "Neon Lights",
        artist: artists.find((a) => a.name === "Night Runners")._id,
        genre: ["Electronic"],
        imageUrl: "/cover-images/5.jpg",
        audioUrl: "/songs/5.mp3",
        duration: 36,
        releaseYear: 2023,
      },
      {
        title: "Urban Jungle",
        artist: artists.find((a) => a.name === "City Lights")._id,
        genre: ["Lo-fi", "Ambient"],
        imageUrl: "/cover-images/15.jpg",
        audioUrl: "/songs/15.mp3",
        duration: 36,
        releaseYear: 2022,
      },
      {
        title: "Neon Dreams",
        artist: artists.find((a) => a.name === "Cyber Pulse")._id,
        genre: ["Electronic", "Lo-fi"],
        imageUrl: "/cover-images/13.jpg",
        audioUrl: "/songs/13.mp3",
        duration: 39,
        releaseYear: 2024,
      },
      {
        title: "Summer Daze",
        artist: artists.find((a) => a.name === "Coastal Kids")._id,
        genre: ["Piano", "Acoustic"],
        imageUrl: "/cover-images/4.jpg",
        audioUrl: "/songs/4.mp3",
        duration: 24,
        releaseYear: 2023,
      },
    ];

    const createdSongs = await Song.insertMany(songs);

    // Create albums with tracks
    const albums = [
      {
        title: "Urban Nights",
        artist: artists.find((a) => a.name === "Urban Echo")._id, // Replace "Various Artists"
        imageUrl: "/albums/1.jpg",
        releaseYear: 2024,
        genre: ["Electronic", "Lo-fi"],
        description:
          "A collection of electronic and lo-fi tracks for urban adventures.",
        isFeatured: true,
        likes: Math.floor(Math.random() * 1000),
        streams: Math.floor(Math.random() * 10000),
        tracks: createdSongs.slice(0, 2).map((song) => song._id),
      },
      {
        title: "Coastal Dreaming",
        artist: artists.find((a) => a.name === "Coastal Kids")._id, // Replace "Various Artists"
        imageUrl: "/albums/2.jpg",
        releaseYear: 2023,
        genre: ["Piano", "Acoustic"],
        description: "Relaxing acoustic tracks inspired by coastal vibes.",
        isFeatured: false,
        likes: Math.floor(Math.random() * 1000),
        streams: Math.floor(Math.random() * 10000),
        tracks: createdSongs.slice(2, 4).map((song) => song._id),
      },
    ];

    const createdAlbums = await Album.insertMany(albums);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
