// Import express using ES6 default import syntax
import express from "express";
const router = express.Router();

// Import authentication controller functions
import { logIn } from "../controllers/login.controller.js";

// Import enhanced authentication middleware
import {
  refreshToken,
  logout,
} from "../middlewares/enhancedAuth.middleware.js";

// Import rate limiting for authentication endpoints
import rateLimit from "express-rate-limit";
import { AUTH_RATE_LIMIT_CONFIG } from "../utils/security.js";

// Apply stricter rate limiting for authentication endpoints
const authLimiter = rateLimit(AUTH_RATE_LIMIT_CONFIG);

// Authentication routes
router.post("/api/login", authLimiter, logIn);
router.post("/api/refresh", authLimiter, refreshToken);
router.post("/api/logout", logout);

// Export router using default export pattern
export default router;
