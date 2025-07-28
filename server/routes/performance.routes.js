/**
 * Performance Routes
 * Handles performance monitoring and metrics endpoints
 */

import express from "express";
import {
  getPerformanceMetrics,
  getPerformanceHistory,
} from "../controllers/performance.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/performance/metrics
 * @desc    Get real-time performance metrics
 * @access  Admin only
 */
router.get("/metrics", verifyToken, isAdmin, getPerformanceMetrics);

/**
 * @route   GET /api/performance/history
 * @desc    Get performance history data for charts
 * @access  Admin only
 */
router.get("/history", verifyToken, isAdmin, getPerformanceHistory);

export default router;
