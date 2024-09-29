import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Environment validation
if (!process.env.MONGODB_URL || !process.env.DB_NAME) {
    console.error('MONGODB_URL and DB_NAME must be set in environment variables');
    process.exit(1); // Exit if env variables are not set
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.DB_NAME, // No deprecated options
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Exit process if connection fails
    }
};

// MongoDB event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (error) => {
    console.error(`Mongoose connection error: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected from DB');
});

// Graceful shutdown handling
const gracefulShutdown = () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });
};

// Listen for termination signals (e.g., CTRL+C or Docker/Kubernetes shutdown)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default connectDB;
