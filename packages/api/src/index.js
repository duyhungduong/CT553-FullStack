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
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { validateEnvironment, config } from "./config/environment.js";

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

// Validate environment before starting
if (!validateEnvironment()) {
  process.exit(1);
}

dotenv.config();

const __dirname = path.resolve();
const PORT = config.port;
const app = express();

// Tạo HTTP server và khởi tạo Socket.IO
const httpServer = createServer(app);
const io = initializeSocket(httpServer); // Khởi tạo Socket.IO
// app.set("io", io); 
app.use((req, res, next) => {
  req.io = io; // Gắn io vào req để controller sử dụng
  next();
});
// Cấu hình CORS an toàn hơn
const allowedOrigins = config.nodeEnv === 'production' 
  ? (config.frontendUrl || '').split(',').filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  })
);

// Middleware cơ bản
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
})); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse req.body với giới hạn
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 100 : 1000, // limit each IP
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests for certain endpoints
  skip: (req) => {
    return req.path.includes('/health') || req.path.includes('/static');
  }
});

app.use('/api/', limiter);
app.use(clerkMiddleware()); // Xác thực Clerk

// Cấu hình upload file an toàn hơn
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
];

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB thay vì 100MB
      files: 5 // Giới hạn số file upload cùng lúc
    },
    abortOnLimit: true,
    responseOnLimit: "File size exceeded limit (50MB max)",
    limitHandler: (req, res, next) => {
      console.warn(`File upload limit exceeded from IP: ${req.ip}`);
      res.status(413).json({ 
        error: "File too large", 
        maxSize: "50MB",
        message: "Please reduce file size and try again" 
      });
    },
    // Validate file types
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    }
  })
);

// Improved cron jobs với better error handling
const tempDir = path.join(process.cwd(), "tmp");

// Cleanup temp files every hour
cron.schedule("0 * * * *", () => {
  console.log('🧹 Starting temp files cleanup...');
  
  if (!fs.existsSync(tempDir)) {
    console.log('📁 Temp directory does not exist, creating...');
    fs.mkdirSync(tempDir, { recursive: true });
    return;
  }

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error("❌ Error reading temp directory:", err);
      return;
    }

    if (files.length === 0) {
      console.log('✨ Temp directory is already clean');
      return;
    }

    let deletedCount = 0;
    let errorCount = 0;

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      
      // Check file age (delete files older than 1 hour)
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`❌ Error getting stats for ${file}:`, statErr);
          errorCount++;
          return;
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (stats.mtime < oneHourAgo) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`❌ Error deleting ${file}:`, unlinkErr);
              errorCount++;
            } else {
              deletedCount++;
              console.log(`🗑️ Deleted old temp file: ${file}`);
            }
          });
        }
      });
    });

    // Log summary after a short delay
    setTimeout(() => {
      console.log(`✅ Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
    }, 1000);
  });
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: Math.floor(process.uptime()),
    message: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
    checks: {
      database: 'checking...',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100 + ' MB',
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100 + ' MB'
      }
    }
  };

  // Check database connection
  try {
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      await mongoose.default.connection.db.admin().ping();
      health.checks.database = 'connected';
    } else {
      health.checks.database = 'disconnected';
    }
  } catch (error) {
    health.checks.database = 'error';
    health.message = 'DEGRADED';
  }

  const status = health.checks.database === 'connected' ? 200 : 503;
  res.status(status).json(health);
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'MelodicBook API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Music streaming platform API',
    endpoints: {
      health: '/health',
      docs: '/api/docs' // For future API documentation
    },
    timestamp: new Date().toISOString()
  });
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
if (config.nodeEnv === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log errors
  if (err.statusCode >= 500) {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Send error response
  if (config.nodeEnv === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    // Production error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    } else {
      // Programming or unknown errors: don't leak error details
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

// This validation is now handled in validateEnvironment() function

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  httpServer.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed');
    
    // Close database connection
    import('mongoose').then(mongoose => {
      mongoose.default.connection.close(() => {
        console.log('✅ Database connection closed');
        process.exit(0);
      });
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Khởi động server
const startServer = async () => {
  try {
    await connectDB(); // Kết nối database trước
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🎵 API ready: http://localhost:${PORT}/api`);
      
      // Log feature status
      if (config.features.enableRedis) {
        console.log(`🔄 Redis: enabled`);
      }
      if (config.features.enableCloudinary) {
        console.log(`☁️ Cloudinary: enabled`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();