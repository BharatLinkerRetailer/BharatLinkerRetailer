import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary configuration in environment variables");
}

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary.
 * 
 * @param {string} localFilePath - The local path of the file to upload.
 * @returns {Promise<string | null>} The URL of the uploaded file or null if upload fails.
 * @throws {Error} If there is an error during the upload or file cleanup process.
 */
const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.error("File path is missing.");
        return null;
    }

    try {
        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Uploaded successfully:", response.url);

        // Attempt to delete the local file after a successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Synchronously delete the file
            console.log(`File ${localFilePath} deleted successfully after upload.`);
        } else {
            console.warn(`File ${localFilePath} was not found for deletion.`);
        }

        return response.url;

    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error.message);

        // Ensure local file cleanup in case of upload failure
        if (fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
                console.log(`File ${localFilePath} deleted after failure.`);
            } catch (unlinkError) {
                console.error(`Failed to delete file ${localFilePath}:`, unlinkError.message);
            }
        }

        return null;
    }
};

export { uploadOnCloudinary };
