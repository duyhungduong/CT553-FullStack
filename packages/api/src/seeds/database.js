import mongoose from "mongoose";

import { config } from "dotenv";
import { Song } from "../models/song.model.js";
import { Artist } from "../models/artist.model.js";
import { Album } from "../models/album.model.js";
import { Library } from "../models/library.model.js";

config();

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Song.deleteMany({});
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Library.deleteMany({});
    console.log("Cleared existing data.");

    // Seed Artists
    const artists = await Artist.insertMany([
      {
        name: "Urban Echo",
        bio: "A collective creating atmospheric and relaxing ambient music.",
        imageUrl: "/artists/urban-echo.jpg",
      },
      {
        name: "Night Runners",
        bio: "Electronic artists exploring the sounds of neon-lit cities.",
        imageUrl: "/artists/night-runners.jpg",
      },
      {
        name: "City Lights",
        bio: "A lo-fi duo that crafts music inspired by urban landscapes.",
        imageUrl: "/artists/city-lights.jpg",
      },
    ]);
    console.log("Seeded artists:", artists.length);

    // Seed Songs
    const songs = await Song.insertMany([
      {
        title: "City Rain",
        author: artists[0]._id,
        genre: ["Ambient", "Nature Sounds"],
        imageUrl: "/songs/city-rain.jpg",
        audioUrl: "/songs/city-rain.mp3",
        duration: 180,
        releaseYear: 2023,
        likes: 120,
        streams: 3000,
      },
      {
        title: "Neon Dreams",
        author: artists[1]._id,
        genre: ["Electronic"],
        imageUrl: "/songs/neon-dreams.jpg",
        audioUrl: "/songs/neon-dreams.mp3",
        duration: 240,
        releaseYear: 2022,
        likes: 200,
        streams: 5000,
      },
      {
        title: "Urban Jungle",
        author: artists[2]._id,
        genre: ["Lo-fi", "Chillout"],
        imageUrl: "/songs/urban-jungle.jpg",
        audioUrl: "/songs/urban-jungle.mp3",
        duration: 150,
        releaseYear: 2023,
        likes: 180,
        streams: 4000,
      },
    ]);
    console.log("Seeded songs:", songs.length);

    // Update Artists with their songs
    await Artist.findByIdAndUpdate(artists[0]._id, { songs: [songs[0]._id] });
    await Artist.findByIdAndUpdate(artists[1]._id, { songs: [songs[1]._id] });
    await Artist.findByIdAndUpdate(artists[2]._id, { songs: [songs[2]._id] });

    // Seed Albums
    const albums = await Album.insertMany([
      {
        title: "Urban Nights",
        author: artists[0]._id,
        releaseYear: 2023,
        genre: ["Ambient", "Lo-fi"],
        imageUrl: "/albums/urban-nights.jpg",
        description: "A relaxing journey through the sounds of the city.",
        tracks: [songs[0]._id, songs[2]._id],
        isFeatured: true,
        likes: 100,
        streams: 2000,
      },
      {
        title: "Electronic Escape",
        author: artists[1]._id,
        releaseYear: 2022,
        genre: ["Electronic"],
        imageUrl: "/albums/electronic-escape.jpg",
        description: "A vibrant electronic music experience.",
        tracks: [songs[1]._id],
        isFeatured: false,
        likes: 200,
        streams: 5000,
      },
    ]);
    console.log("Seeded albums:", albums.length);

    // Update Library
    const libraries = await Library.insertMany([
      {
        userId: new mongoose.Types.ObjectId(), // Replace with a real user ID
        favoriteSongs: [songs[0]._id, songs[1]._id],
        favoriteAlbums: [albums[0]._id],
        playlists: [
          {
            name: "Relaxing Vibes",
            description: "Chill out with these ambient tracks.",
            songs: [songs[0]._id, songs[2]._id],
          },
        ],
      },
    ]);
    console.log("Seeded libraries:", libraries.length);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
