import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Helper function to upload to Cloudinary
 * @param buffer - File buffer
 * @param folder - Cloudinary folder name
 * @returns Secure URL of the uploaded image
 */
export const uploadToCloudinary = (buffer: Buffer, folder: string = "vocabulary"): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result!.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};
