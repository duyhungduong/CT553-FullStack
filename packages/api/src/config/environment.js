// Environment configuration validation
import dotenv from 'dotenv';

dotenv.config();

// Required environment variables
const requiredEnvVars = {
  // Database
  MONGODB_URI: 'MongoDB connection string',
  
  // Authentication
  CLERK_PUBLISHABLE_KEY: 'Clerk publishable key',
  CLERK_SECRET_KEY: 'Clerk secret key',
  
  // File Upload (optional)
  CLOUDINARY_CLOUD_NAME: 'Cloudinary cloud name (optional)',
  CLOUDINARY_API_KEY: 'Cloudinary API key (optional)',
  CLOUDINARY_API_SECRET: 'Cloudinary API secret (optional)',
  
  // Frontend URL
  FRONTEND_URL: 'Frontend URL for CORS (optional, defaults to localhost)'
};

// Optional environment variables with defaults
const optionalEnvVars = {
  PORT: '3000',
  NODE_ENV: 'development',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'your-jwt-secret-here'
};

export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      missing.push(`${key} - ${description}`);
    }
  });

  // Check optional variables and set defaults
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      warnings.push(`${key} not set, using default: ${defaultValue}`);
    }
  });

  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(variable => console.error(`   - ${variable}`));
    console.error('\n💡 Create a .env file with these variables or set them in your environment.');
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Using default values for:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  console.log('✅ Environment configuration validated');
  return true;
};

// Export environment config object
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL,
  
  // Authentication
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
  
  // File Upload
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL,
  
  // Security
  jwtSecret: process.env.JWT_SECRET,
  
  // Features flags
  features: {
    enableRedis: !!process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379',
    enableCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    enableDebugLogging: process.env.NODE_ENV === 'development',
  }
};

export default config;
