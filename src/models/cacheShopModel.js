import mongoose, { Schema } from 'mongoose';

// Shop Schema
const cacheShopSchema = new Schema({
    owner: {
        firstName: {
            type: String,
            required: true
        },
        middleName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            match: [/.+@.+\..+/, 'Please enter a valid email address']
        },
        images:{
            type:String
        }
    },
    shopName: {
        type: String,
        required: true
    },
    pinCodes: [{
        type: Number,
        required: true
    }],
    address: {
        type: String,
        required: true
    },
    location: { // Changed from array to object
        latitude: {
            type: Number, // Capitalized "Number"
            required: true
        },
        longitude: {
            type: Number, // Capitalized "Number"
            required: true
        }
    },
    phoneNumber: {
        type: Number,
        unique: true,
        required: true
    },
    email: {
        type: String,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
       
    },
    shopImages: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['opened', 'closed'], // Restrict status values to 'open' and 'closed'
        default: 'closed'
    },
    registerStatus: {
        type: String,
        enum: ['pending'], // Restrict registerStatus to specific values
        default: 'pending'
    },
    password: {
        type: String
    }
});

// Model for Shop
const CacheShop = mongoose.model('CacheShop', cacheShopSchema);

// Exporting Models
export { CacheShop };
