import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

import shopRouter from './src/api/router/shopRouter.js'
// Initialize dotenv for environment variables
dotenv.config();

// Create an instance of express
const app = express();

// Middleware

// JSON and URL-encoded form parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Enable CORS with stricter options for production
const corsOptions = {
    origin:["http://localhost:5173","http://192.168.48.200:5173"],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Secure app by setting various HTTP headers with Helmet
app.use(helmet());

// Compress responses to enhance performance
app.use(compression());

// Rate limiting to prevent DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Logging HTTP requests using morgan for detailed logs
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'; 
app.use(morgan(logFormat)); // Use 'combined' for production, 'dev' for development

// Serve static files if necessary (e.g., in case of serving front-end in production)
// app.use(express.static(path.join(__dirname, 'public')));

// Example route
app.get('/', (req, res) => {
    res.status(200).send('Hello, World!');
});
app.use('/shop',shopRouter);

// Centralized error handling (customized for different environments)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const env = process.env.NODE_ENV || 'development';
    const errorResponse = {
        message: err.message || 'Internal Server Error',
    };

    // Include stack trace in development mode
    if (env === 'development') {
        errorResponse.stack = err.stack;
    }

    // Log the error (optional: use a logger like winston here)
    console.error(`[${new Date().toISOString()}] ${statusCode} - ${err.message} - ${req.originalUrl}`);

    res.status(statusCode).json(errorResponse);
});

// Fallback route for 404 (Not Found)
app.use((req, res) => {
    res.status(404).send({ message: 'Route not found' });
});

// Export the express instance
export { app };
