import mongoose from 'mongoose';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// Logger setup using winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Environment validation
if (!process.env.MONGODB_URL || !process.env.DB_NAME) {
    logger.error('MONGODB_URL and DB_NAME must be set in environment variables');
    process.exit(1); // Exit if env variables are not set
}

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.DB_NAME, // No deprecated options
        });
        logger.info(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Exit process if connection fails
    }
};

// MongoDB event listeners
mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (error) => {
    logger.error(`Mongoose connection error: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB disconnected from DB');
});

// Graceful shutdown handling
const gracefulShutdown = () => {
    mongoose.connection.close(() => {
        logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
    });
};

// Listen for termination signals (e.g., CTRL+C or Docker/Kubernetes shutdown)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default connectDB;
