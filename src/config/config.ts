require('dotenv').config();

export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '1y';
export const PORT = process.env.PORT || 3000;
export const MONGODB_URI =
    String(process.env.MONGODB_URI) || 'mongodb://localhost:27017/test';
