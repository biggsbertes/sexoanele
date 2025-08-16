import path from 'path';

export default {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite'),
  upload: {
    dest: process.env.UPLOAD_DEST || 'uploads/',
    maxSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['.csv']
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080'
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
    maxLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 100
  }
};
