import { Shop } from '../../models/shopModel.js';
import { apiFeatures } from '../../utils/apiFeatures.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import bcrypt from 'bcryptjs';

import cloudinary from 'cloudinary';
/**
 * Get shops with pagination.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */

//shoplogin
const shopLogin = async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        // Check if the shop exists by phone number
        const shop = await Shop.findOne({ phoneNumber });
        if (!shop) {
            return res.status(400).json({ message: 'Shop not found with this phone number.' });
        }

        // Compare password with hashed password in the database
        const isPasswordCorrect = await bcrypt.compare(password, shop.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Optionally, generate a JWT token for authentication (you can skip this if not needed)
        // const token = jwt.sign({ shopId: shop._id }, 'your_jwt_secret_key', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful!',
            shop: {
                id: shop._id,
                shopName: shop.shopName,
                phoneNumber: shop.phoneNumber,
                email: shop.email,
                status: shop.status,
                pincodes:shop.pinCodes,
                registerStatus: shop.registerStatus,
            }
            // token, 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred during login.', error });
    }
};

const shopSignUp = async (req, res) => {
    const { owner, shopName, pinCodes, shopAddress,shopPhoneNumber, email, password } = req.body;
   console.log(pinCodes)
    try {
        // Parse owner and location data from JSON strings
        // const ownerData = JSON.parse(owner);
        const ownerData = owner;
        // const pincodeData = Array.isArray(pinCodes) ? pinCodes : pinCodes.split(',');
        const pincodeData =pinCodes;

        // Check if the shop already exists by phone number or email
        const existingShop = await Shop.findOne({
            $or: [{ phoneNumber:shopPhoneNumber }] // Check for existing email as wel
        });

        if (existingShop) {
            return res.
            status(400).
            json({ message: 'Shop with this phone number already exists.' });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new shop document
        const newShop = new Shop({
            owner: ownerData,
            shopName,
            pinCodes:pincodeData,
            address:shopAddress,
            phoneNumber:shopPhoneNumber,
            email,
            password: hashedPassword,
            key:password
        });

        // Save the new shop in the database
        await newShop.save();

        // Send success response
        res.status(201).json({ message: 'Shop registered successfully!', shop: newShop });
    } catch (error) {
        console.error('Error during shop registration:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error occurred while registering shop', error });
    }
};




const getShops = asyncHandler(async (req, res, next) => {
    console.log(req.query);  // Log the query parameters for debugging

    // Create an instance of ApiFeatures with filtering and pagination methods
    const apiFeature = new apiFeatures(Shop.find(), req.query)
       .searchShop()          
       .filterByPincode()        // Filter by Pincode if provided
       .filterByRegisterStatus() // Filter by shop registration status
       .filterByCategory();      // Filter by categories

    // Pagination logic: Apply after filters and search are executed
    const resultPerPage = parseInt(req.query.limit) || 15;  // Default limit is 15
    const currentPage = parseInt(req.query.page) || 1;      // Default to page 1 if not provided

    const totalShops = await Shop.countDocuments(apiFeature.getFilter());  // Total shop count based on filters
    apiFeature.pagination(resultPerPage);  // Apply pagination method from ApiFeatures

    // Execute the query to get filtered shops
    const shops = await apiFeature.query;
    const filteredShopsCount = shops.length;  // Count shops returned after filtering
  
    // Calculate total pages
    const totalPages = Math.ceil(totalShops / resultPerPage);

    // Send the response with shop data, counts, and pagination info
    res.status(200).json({
       success: true,
       shops,                // Array of filtered shops
       count: filteredShopsCount,  // Number of shops after filtering
       total: totalShops,    // Total shop count based on filters
       currentPage,          // Current page being displayed
       totalPages            // Total number of pages
    });
});






const getShopDetail = asyncHandler(async (req, res) => {
    const { shopId } = req.query;

    // Validate the shopId
    if (!shopId) {
        return res.status(400).json({
            success: false,
            message: "Shop ID is required."
        });
    }

 
    const shop = await Shop.findById(shopId)
        .populate({
            path: 'owner',
            select: 'firstName lastName email phoneNumber -password' // Exclude password
        })
        .select('shopName pinCodes address phoneNumber email shopImages status registerStatus'); // Other shop fields


    if (!shop) {
        return res.status(404).json({
            success: false,
            message: "Shop not found."
        });
    }

    // Successful response
    return res.status(200).json({
        success: true,
        shop
    });
});

const ownerDetail = asyncHandler(async (req, res) => {
    const { shopId } = req.query;

    // Check if shopId is provided
    if (!shopId) {
        return res.status(400).json({
            success: false,
            message: "shopID is required"
        });
    }

    // Find the shop by ID and populate the owner details
    const shop = await Shop.findById(shopId).populate('owner');

    // Check if the shop exists
    if (!shop) {
        return res.status(404).json({
            success: false,
            message: "Shop not found"
        });
    }

    // Return the owner details along with the shop information
    return res.status(200).json({
        success: true,
        shop,
        owner: shop.owner // Include owner details in the response
    });
});

const deleteShopImage = asyncHandler(async (req, res) => {
    const { shopId, imageUrl } = req.query;
    console.log(shopId,imageUrl)
    try {
        // Find the shop by ID
        const shop = await Shop.findById(shopId);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found.' });
        }

        // Check if the image exists in the shop's images array
        const imageIndex = shop.shopImages.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(400).json({ message: 'Image not found in the shop.' });
        }

        // Delete the image from Cloudinary
        const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary

        // Remove the image URL from the shop's images array
        shop.shopImages.splice(imageIndex, 1);

        // Save the updated shop document
        await shop.save();

        res.status(200).json({ message: 'Image deleted successfully.', images: shop.shopImages });
    } catch (error) {
        console.error('Error deleting shop image:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error occurred while deleting image.', error });
    }
});


// const uploadShopImage = asyncHandler(async (req, res) => {
//     const { shopId } = req.body;
//     let images = [];
//     const files = req.files;

//     if (!files || files.length === 0) {
//         return res.status(404).json({ message: "There are no images to upload." });
//     }

//     try {
       
//         for (const file of files) {
//             const imageUrl = await uploadOnCloudinary(file.path);
//             images.push(imageUrl);
//         }

//         const shop = await Shop.findById(shopId);
//         if (!shop) {
//             return res.status(404).json({ message: 'Shop not found.' });
//         }

//         shop.shopImages = [...shop.shopImages, ...images];
//         await shop.save();

//         res.status(200).json({ message: 'Images uploaded successfully!', images: images });
//     } catch (error) {
//         console.error('Error uploading shop images:', error);
//         res.status(500).json({ message: 'Server error occurred while uploading images.', error });
//     }
// });

const uploadShopImage = asyncHandler(async (req, res) => {
    const { shopId } = req.body;
    let images = [];
    const files = req.files;

    // Check if files are provided
    if (!files || files.length === 0) {
        return res.status(404).json({ message: "There are no images to upload." });
    }

    try {
        // Upload each file buffer to Cloudinary
        for (const file of files) {
            // Use the file buffer instead of file.path
            const imageUrl = await uploadOnCloudinary(file.buffer); // Pass buffer directly to Cloudinary
            images.push(imageUrl); // Assuming uploadOnCloudinary returns the URL
        }

        // Find the shop and update its images
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found.' });
        }

        // Update shop images by appending new ones
        shop.shopImages = [...shop.shopImages, ...images];
        await shop.save();

        res.status(200).json({ message: 'Images uploaded successfully!', images: images });
    } catch (error) {
        console.error('Error uploading shop images:', error);
        res.status(500).json({ message: 'Server error occurred while uploading images.', error });
    }
});



const openclosed = asyncHandler(async (req, res) => {
    const { shopId, number } = req.query;

    // Check if shopId and number are provided
    if (!shopId || !number) {
        return res.status(400).json({ message: "Missing data" });
    }

    // Validate the number parameter
    const isOpen = number === '1'; // number should be a string as it comes from query params

    try {
        const shop = await Shop.findById(shopId);

        // Check if the shop exists
        if (!shop) {
            return res.status(404).json({ message: "Shop not found." });
        }

        // Update the shop's status
        shop.status = isOpen ? 'opened' : 'closed'; // Ensure the status is a string
        await shop.save();

        res.status(200).json({ message: `Shop status updated to ${isOpen ? 'opened' : 'closed'}.`, shop });
    } catch (error) {
        console.error('Error updating shop status:', error);
        res.status(500).json({ message: 'Server error occurred while updating shop status.', error });
    }
});


const updateShopData = asyncHandler(async (req, res) => {
    const { shopId } = req.query; // Extracting shopId from the query parameters
    const { owner, location, pinCodes, shopName, address, email} = req.body; // Extracting fields from request body

    // Check if the shopId is provided
    if (!shopId) {
        return res.status(400).json({ message: "Shop ID is required." });
    }
    // Create an object to store updates
    const updates = {};

    // Process pinCodes if provided (assuming pinCodes might come as a comma-separated string or array)
    if (pinCodes) {
        const pincodeData = Array.isArray(pinCodes) ? pinCodes : pinCodes.split(',');
        updates.pinCodes = pincodeData;
    }

    // Add shop data fields to the updates object
    if (shopName) updates.shopName = shopName;
    if (address) updates.address = address;
    if (email) updates.email = email;

    // If location data is provided, parse and assign latitude and longitude
    if (location) {
        try {
            const locationData = JSON.parse(location);
            updates.location = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            };
        } catch (error) {
            return res.status(400).json({ message: "Invalid location data." });
        }
    }

    // Process owner data if provided
    if (owner) {
        try {
            const ownerData = owner;
            updates.owner = {}; // Initialize owner object for updates
            if (ownerData.firstName) updates.owner.firstName = ownerData.firstName;
            if (ownerData.middleName) updates.owner.middleName = ownerData.middleName;
            if (ownerData.lastName) updates.owner.lastName = ownerData.lastName;
            if (ownerData.phoneNumber) updates.owner.phoneNumber = ownerData.phoneNumber;
            if (ownerData.email) updates.owner.email = ownerData.email;
        } catch (error) {
            return res.status(400).json({ message: "Invalid owner data." });
        }
    }

    // If there are no updates, respond with a message
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update." });
    }

    try {
        // Find the shop by ID and update it with the new data
        const updatedShop = await Shop.findByIdAndUpdate(shopId, updates, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validation
        });

        // Check if the shop was found and updated
        if (!updatedShop) {
            return res.status(404).json({ message: "Shop not found." });
        }

        // Respond with the updated shop data
        res.status(200).json({ message: "Shop updated successfully!", shop: updatedShop });
    } catch (error) {
        console.error('Error updating shop data:', error);
        res.status(500).json({ message: 'Server error occurred while updating shop data.', error });
    }
});



const deleteShop = asyncHandler(async (req, res) => {
    const { shopId } = req.query; // Get the shop ID from query params

    // Check if the shopId is provided
    if (!shopId) {
        return res.status(400).json({ message: "Shop ID is required." });
    }

    try {
        // Find the shop by ID
        const shop = await Shop.findById(shopId);

        // Check if the shop exists
        if (!shop) {
            return res.status(404).json({ message: "Shop not found." });
        }   // Delete all shop images associated with the shop from Cloudinary
        if (shop.shopImages && shop.shopImages.length > 0) {
            const deleteShopImagePromises = shop.shopImages.map(async (imageUrl) => {
                const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
            });

            // Wait for all shop images to be deleted
            await Promise.all(deleteShopImagePromises);
        }

        // Delete all owner's images from Cloudinary
        if (shop.owner && shop.owner.images && shop.owner.images.length > 0) {
            const deleteOwnerImagePromises = shop.owner.images.map(async (imageUrl) => {
                const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
            });

            // Wait for all owner's images to be deleted
            await Promise.all(deleteOwnerImagePromises);
        }

        // After all images are deleted, delete the shop
        const deletedShop = await Shop.findByIdAndDelete(shopId);

        // If shop not found
        if (!deletedShop) {
            return res.status(404).json({ message: "Shop not found." });
        }

        // Respond with success
        res.status(200).json({ message: "Shop and its images (including owner's images) deleted successfully." });
    } catch (error) {
        console.error('Error deleting shop and images:', error);
        res.status(500).json({ message: 'Server error occurred while deleting shop and images.', error });
    }
});



export {
    shopLogin, shopSignUp, getShops,
    getShopDetail, ownerDetail, deleteShopImage,
    uploadShopImage, openclosed, updateShopData,
    deleteShop
};
