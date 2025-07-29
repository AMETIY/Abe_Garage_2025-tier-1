// Import and configure dotenv first to ensure environment variables are loaded
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, ".env") });

// Import the express module using ES6 default import syntax
import express from "express";
// Import the sanitizer module using ES6 default import syntax
import sanitize from "sanitize";
// Import the CORS module using ES6 default import syntax
import cors from "cors";
// Import security middleware
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// Import performance middleware
import compression from "compression";

// Set up the CORS options to allow requests from our front-end
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://abe-garage-frontend.vercel.app",
    ].filter(Boolean); // Remove any undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true, // Allow credentials
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
};

// Create a variable to hold our port number
const PORT = process.env.PORT;
// Import the router using default import with .js extension
import router from "./routes/index.js";
// Import error handling middleware
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";
// Import logging middleware
import {
  requestLogger,
  responseLogger,
  errorLogger,
  performanceLogger,
} from "./middlewares/logging.middleware.js";
// Import performance middleware
import {
  performanceMonitor,
  memoryMonitor,
} from "./middlewares/performance.middleware.js";

// Create the webserver
const app = express();

// Performance middleware - compression should be early
app.use(
  compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use compression for all other requests
      return compression.filter(req, res);
    },
  })
);

// Security middleware - must be first
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    error: {
      type: "RATE_LIMIT",
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
      severity: "medium",
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Performance monitoring - add early in middleware chain
app.use(performanceMonitor);

// Memory monitoring (log every 5 minutes)
setInterval(memoryMonitor, 5 * 60 * 1000);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: "error",
    error: {
      type: "RATE_LIMIT",
      message: "Too many authentication attempts, please try again later.",
      statusCode: 429,
      severity: "high",
      timestamp: new Date().toISOString(),
    },
  },
});

// Apply stricter rate limiting to auth routes
app.use("/api/login", authLimiter);

// Add logging middleware (before other middleware)
app.use(
  requestLogger({
    logBody: process.env.NODE_ENV === "development",
    logQuery: true,
    excludePaths: ["/health", "/favicon.ico"],
  })
);
app.use(
  responseLogger({
    logBody: process.env.NODE_ENV === "development",
  })
);
app.use(
  performanceLogger({
    slowRequestThreshold: 1000,
  })
);

// Add the CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Add the sanitizer to the express middleware
app.use(sanitize.middleware);

// Add the routes to the application as middleware
app.use(router);

// Add 404 handler for unmatched routes
app.use(notFoundHandler);

// Add error logging middleware (before global error handler)
app.use(errorLogger);

// Add global error handling middleware (must be last)
app.use(globalErrorHandler);

// Debug environment variables
console.log("Environment variables loaded:", {
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV,
});

// Start the webserver
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

// Export the webserver for use in the application using default export
export default app;
