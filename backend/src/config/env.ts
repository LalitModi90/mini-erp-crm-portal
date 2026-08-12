import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseUrl: process.env.DATABASE_URL || '',
  smtp: {
    host: process.env.SMTP_HOST || process.env.HOST || '',
    port: Number(process.env.SMTP_PORT || process.env.PORT_MAIL || 587),
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || '',
    from: process.env.SMTP_FROM || process.env.EMAIL_USER || '',
  },
};
