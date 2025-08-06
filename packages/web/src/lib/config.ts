// Environment configuration utility for type-safe environment variables

interface EnvironmentConfig {
  // API Configuration
  API_URL: string;
  API_TIMEOUT: number;
  
  // Third-party APIs
  GIPHY_API_KEY?: string;
  
  // Development Settings
  ENABLE_DEBUG_LOGS: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  
  // Feature Flags
  ENABLE_EXPERIMENTAL_FEATURES: boolean;
  ENABLE_VOICE_RECOGNITION: boolean;
  ENABLE_SOCIAL_FEATURES: boolean;
  
  // Environment Info
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  MODE: string;
}

// Type-safe environment variable access
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  
  if (!value && !defaultValue) {
    console.warn(`⚠️ Environment variable ${key} is not set`);
    return '';
  }
  
  return value || defaultValue || '';
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  const numValue = parseInt(value, 10);
  return isNaN(numValue) ? defaultValue : numValue;
};

// Create configuration object
export const config: EnvironmentConfig = {
  // API Configuration
  API_URL: getEnvVar('VITE_API_URL', 
    import.meta.env.MODE === 'development' 
      ? 'http://localhost:5000/api' 
      : '/api'
  ),
  API_TIMEOUT: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
  
  // Third-party APIs
  GIPHY_API_KEY: getEnvVar('VITE_GIPHY_API_KEY'),
  
  // Development Settings
  ENABLE_DEBUG_LOGS: getBooleanEnvVar('VITE_ENABLE_DEBUG_LOGS', import.meta.env.MODE === 'development'),
  ENABLE_PERFORMANCE_MONITORING: getBooleanEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', false),
  ENABLE_ERROR_REPORTING: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING', false),
  
  // Feature Flags
  ENABLE_EXPERIMENTAL_FEATURES: getBooleanEnvVar('VITE_ENABLE_EXPERIMENTAL_FEATURES', false),
  ENABLE_VOICE_RECOGNITION: getBooleanEnvVar('VITE_ENABLE_VOICE_RECOGNITION', true),
  ENABLE_SOCIAL_FEATURES: getBooleanEnvVar('VITE_ENABLE_SOCIAL_FEATURES', true),
  
  // Environment Info
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  MODE: import.meta.env.MODE || 'development',
};

// Validation function
export const validateEnvironment = (): void => {
  const required: Array<keyof EnvironmentConfig> = [
    'API_URL',
  ];
  
  const missing: string[] = [];
  
  required.forEach(key => {
    if (!config[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (config.ENABLE_DEBUG_LOGS) {
    console.log('🔧 Environment Configuration:', {
      mode: config.MODE,
      apiUrl: config.API_URL,
      features: {
        experimental: config.ENABLE_EXPERIMENTAL_FEATURES,
        voiceRecognition: config.ENABLE_VOICE_RECOGNITION,
        socialFeatures: config.ENABLE_SOCIAL_FEATURES,
      }
    });
  }
};

// Initialize validation
if (typeof window !== 'undefined') {
  validateEnvironment();
}

export default config;
