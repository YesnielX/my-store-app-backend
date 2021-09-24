require('dotenv').config();

export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '1y';

export const NODEMAILER_USER = process.env.NODEMAILER_USER || 'user';
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS || 'pass';
export const NODEMAILER_PORT = process.env.NODEMAILER_PORT || 465;
export const NODEMAILER_HOST = process.env.NODEMAILER_HOST || 'smtp.gmail.com';

export const CLOUDINARY_CLOUD_NAME =
    process.env.CLOUDINARY_CLOUD_NAME || 'cloud-name';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'api_key';
export const CLOUDINARY_API_SECRET =
    process.env.CLOUDINARY_API_SECRET || 'api_secret';

export const PORT = process.env.PORT || 3000;
export const APP_HOST = process.env.APP_HOST || 'http://localhost:3000';
export const MONGODB_URI =
    String(process.env.MONGODB_URI) || 'mongodb://localhost:27017/test';
