/**
 * Database Performance Routes
 * Provides API endpoints for database monitoring and performance analysis
 */

import express from "express";
import {
  getDatabasePerformance,
  getDatabaseHealth,
  getQueryHistory,
  getSlowQueries,
  getFailedQueries,
  resetDatabaseMetrics,
  getDatabaseConnectionStatus,
  testDatabaseConnection,
  getDatabaseConfig,
} from "../controllers/database-performance.controller.js";
import { verifyToken } from "../middlewares/enhancedAuth.middleware.js";

const router = express.Router();

// Database performance monitoring routes
router.get("/performance", verifyToken, getDatabasePerformance);
router.get("/health", verifyToken, getDatabaseHealth);
router.get("/queries/history", verifyToken, getQueryHistory);
router.get("/queries/slow", verifyToken, getSlowQueries);
router.get("/queries/failed", verifyToken, getFailedQueries);
router.post("/metrics/reset", verifyToken, resetDatabaseMetrics);
router.get("/connection/status", verifyToken, getDatabaseConnectionStatus);
router.get("/connection/test", verifyToken, testDatabaseConnection);
router.get("/config", verifyToken, getDatabaseConfig);

export default router;
