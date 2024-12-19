const cloudinary = require('cloudinary');
const asyncHandler = require('express-async-handler');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

/**
 * Upload one/multiple images to Cloudinary
 * @param {Object[]} images - List of images data (binary I guess)
 * @param {string} folder - The path to which the images get uploaded on Cloudinary
 * @returns {Array<{publicID: string, url: string}>} An array of objects, each containing:
 * - `publicID` (string): the publicID of the image on Cloudinary
 * - `url` (string): the https url of the image
 */

const uploadImages = asyncHandler(async function cloudinaryUploadWrapper(images, folder) {
    const imageResult = await Promise.all(images.map(async (image) => {
        try {
            const buffer = Buffer.from(image);

            // Upload the image using a stream
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    { folder },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(result);
                        }
                    }
                );
                stream.end(buffer);
            });

            // Return the secure URL
            return {
                publicID: uploadResult.public_id,
                url: uploadResult.secure_url
            };
        }
        catch (error) {
            for (const [key, value] of Object.entries(error)) {
                console.error(`${key}:`);
            }
            throw new Error(error.error);
        }
    }));

    return imageResult;
});

/**
 * Delete all resources by prefix on the cloud 
 * @param {string} folder - The prefix
 * */ 
const deleteByPrefix = asyncHandler(async function cloudinaryDeleteWrapper(folder) {
    try {
        await cloudinary.v2.api.delete_resources_by_prefix(folder);
    }
    catch (error) {
        throw new Error(error.error);
    }
});

/**
 * Delete resources by their publicIDs
 * @param {Object[]} publicIDs - List of publicIDs
 */
const deleteResources = asyncHandler(async function cloudinaryDeleteResourcesWrapper(publicIDs) {
    try {
        await cloudinary.v2.api.delete_resources(publicIDs);
    }
    catch (error) {
        throw new Error(error.error);
    }
});

/**
 * Do I even have to explain this shiet?
 * @param {string} folder - Folder name on Cloudinary, this is a path just like in the uploadImages
 */
const deleteFolder = asyncHandler(async function cloudinaryDeleteFolderWrapper(folder) {
    try {
        await cloudinary.v2.api.delete_folder(folder);
    }
    catch (error) {
        if (error.error.http_code !== 404)
            throw new Error(error.error);
    }
});

module.exports = { uploadImages, deleteResources, deleteByPrefix, deleteFolder };