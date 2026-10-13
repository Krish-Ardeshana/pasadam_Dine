export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  frontendBaseUrl: string;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  superAdmin: {
    name: string;
    email: string;
    password: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder: string;
  };
  media: {
    driver: 'local' | 'cloudinary';
    uploadDir: string;
    maxFileSizeMb: number;
  };
  throttler: {
    ttl: number;
    limit: number;
  };
}

export default (): AppConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prasadam_dine',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'prasadam_dine_jwt_secret_key_2026_super_secure',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'prasadam_dine_jwt_refresh_secret_key_2026_super_secure',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || 'Platform Administrator',
    email: (process.env.SUPER_ADMIN_EMAIL || 'admin@prasadamdine.com').toLowerCase(),
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@SecurePrasadam2026!',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'prasadam_dine',
  },
  media: {
    driver: (process.env.MEDIA_STORAGE_DRIVER as 'local' | 'cloudinary') || 'local',
    uploadDir: process.env.MEDIA_UPLOAD_DIR || './uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
});
