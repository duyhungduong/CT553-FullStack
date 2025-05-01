import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./lib/db.js";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import cron from "node-cron";

// Import các tuyến đường
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import searchRoute from "./routes/search.route.js";
import recommendationsRoute from "./routes/recommendation.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import artistRoutes from "./routes/artist.route.js";
import queueRoutes from "./routes/queue.route.js";
import genreRoutes from "./routes/genre.route.js";
import instrumentRoutes from "./routes/instrument.route.js";
import trackArtistRoutes from "./routes/trackArtist.route.js";
import trackGenreRoutes from "./routes/trackGenre.route.js";
import trackInstrumentRoutes from "./routes/trackInstrument.route.js";
import albumTrackRoutes from "./routes/albumTrack.route.js";
// import stickerRoutes from "./routes/sticker.route.js";
// import reviewRoutes from "./routes/review.route.js"
dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 3000; // Thêm giá trị mặc định nếu PORT không được định nghĩa
const app = express();

// Tạo HTTP server và khởi tạo Socket.IO
const httpServer = createServer(app);
const io = initializeSocket(httpServer); // Khởi tạo Socket.IO
// app.set("io", io); 
app.use((req, res, next) => {
  req.io = io; // Gắn io vào req để controller sử dụng
  next();
});
// Cấu hình CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware cơ bản
app.use(express.json()); // Parse req.body
app.use(clerkMiddleware()); // Xác thực Clerk

// Cấu hình upload file
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: 1024 * 1024 * 100, // 100MB
    },
  })
);

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

// Định nghĩa các router
app.use("/api/users", userRoutes); // conversation và message routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/search", searchRoute);
app.use("/api/recommendations", recommendationsRoute);
app.use("/api/trackartist", trackArtistRoutes);
app.use("/api/trackgenre", trackGenreRoutes);
app.use("/api/trackinstrument", trackInstrumentRoutes);
app.use("/api/albumtrack", albumTrackRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/stickers", stickerRoutes);
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err); // Log lỗi để debug
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Khởi động server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Kết nối database
});