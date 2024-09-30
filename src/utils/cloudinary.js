// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import dotenv from 'dotenv';

// dotenv.config();


// const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
// if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
//     throw new Error("Missing Cloudinary configuration in environment variables");
// }


// cloudinary.config({
//     cloud_name: CLOUDINARY_CLOUD_NAME,
//     api_key: CLOUDINARY_API_KEY,
//     api_secret: CLOUDINARY_API_SECRET
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     if (!localFilePath) {
//         console.error("File path is missing.");
//         return null;
//     }

//     try {
  
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         });

//         console.log("Uploaded successfully:", response.url);

//         if (fs.existsSync(localFilePath)) {
//             fs.unlinkSync(localFilePath);
//             console.log(`File ${localFilePath} deleted successfully after upload.`);
//         } else {
//             console.warn(`File ${localFilePath} was not found for deletion.`);
//         }

//         return response.url;

//     } catch (error) {
//         console.error("Error uploading file to Cloudinary:", error.message);

//         if (fs.existsSync(localFilePath)) {
//             try {
//                 fs.unlinkSync(localFilePath);
//                 console.log(`File ${localFilePath} deleted after failure.`);
//             } catch (unlinkError) {
//                 console.error(`Failed to delete file ${localFilePath}:`, unlinkError.message);
//             }
//         }

//         return null;
//     }
// };

// export { uploadOnCloudinary };

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';  // ES module syntax for streams
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary credentials are set correctly
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary configuration in environment variables");
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/**
 * Uploads an image buffer to Cloudinary and returns the URL.
 *
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} filename - The original name of the file.
 * @returns {Promise<string|null>} The URL of the uploaded file or null if the upload fails.
 */
const uploadOnCloudinary = (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload failed:', error);
                reject(null);
            } else {
                resolve(result.url);  // Return the uploaded file's URL
            }
        });

        // Create a readable stream from the buffer and pipe it to Cloudinary
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null); // End the stream
        readableStream.pipe(uploadStream);
    });
};

export { uploadOnCloudinary };
