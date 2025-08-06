import mongoose from "mongoose";
import { Artist } from "../models/artist.model.js";
import { config } from "dotenv";

config();

const artists = [
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
  {
    name: "Cyber Pulse",
    bio: "Innovators in electronic and lo-fi music genres.",
    imageUrl: "/artists/cyber-pulse.jpg",
  },
  {
    name: "Coastal Kids",
    bio: "Acoustic storytellers capturing the essence of summer vibes.",
    imageUrl: "/artists/coastal-kids.jpg",
  },
];

const seedArtists = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing artists
    console.log("Clearing existing artists...");
    const deletedCount = await Artist.deleteMany({});
    console.log(`Deleted ${deletedCount.deletedCount} artists.`);

    // Insert new artists
    console.log("Inserting new artists...");
    const insertedArtists = await Artist.insertMany(artists);
    console.log(`Inserted ${insertedArtists.length} artists successfully!`);
  } catch (error) {
    console.error("Error seeding artists:", error);
  } finally {
    console.log("Closing database connection...");
    mongoose.connection.close();
  }
};

seedArtists();
