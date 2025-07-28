/**
 * Database Performance Controller
 * Provides endpoints for database monitoring and performance analysis
 */

import {
  getDatabaseMetrics,
  getDatabaseReport,
  getQueryHistory as getQueryHistoryService,
  getSlowQueries as getSlowQueriesService,
  getFailedQueries as getFailedQueriesService,
  resetDatabaseMetrics as resetDatabaseMetricsService,
} from "../services/database-monitoring.service.js";
import { performanceTracker } from "../services/performance.service.js";
import { dbAdapter } from "../config/database.config.js";

/**
 * Get database performance metrics
 */
export const getDatabasePerformance = async (req, res) => {
  try {
    const metrics = getDatabaseMetrics();
    const connectionStatus = dbAdapter.getConnectionStatus();
    const performanceStats = performanceTracker.getStats();

    res.json({
      success: true,
      data: {
        metrics,
        connectionStatus,
        performanceStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting database performance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve database performance metrics",
    });
  }
};

/**
 * Get database health report
 */
export const getDatabaseHealth = async (req, res) => {
  try {
    const report = getDatabaseReport();
    const connectionStatus = dbAdapter.getConnectionStatus();

    res.json({
      success: true,
      data: {
        ...report,
        connectionStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting database health:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve database health report",
    });
  }
};

/**
 * Get query history
 */
export const getQueryHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = getQueryHistoryService(limit);

    res.json({
      success: true,
      data: {
        queries: history,
        count: history.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting query history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve query history",
    });
  }
};

/**
 * Get slow queries
 */
export const getSlowQueries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const slowQueries = getSlowQueriesService(limit);

    res.json({
      success: true,
      data: {
        queries: slowQueries,
        count: slowQueries.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting slow queries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve slow queries",
    });
  }
};

/**
 * Get failed queries
 */
export const getFailedQueries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const failedQueries = getFailedQueriesService(limit);

    res.json({
      success: true,
      data: {
        queries: failedQueries,
        count: failedQueries.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting failed queries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve failed queries",
    });
  }
};

/**
 * Reset database metrics
 */
export const resetDatabaseMetrics = async (req, res) => {
  try {
    resetDatabaseMetricsService();
    performanceTracker.resetStats();

    res.json({
      success: true,
      message: "Database metrics reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error resetting database metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset database metrics",
    });
  }
};

/**
 * Get database connection status
 */
export const getDatabaseConnectionStatus = async (req, res) => {
  try {
    const connectionStatus = dbAdapter.getConnectionStatus();
    const poolStats = dbAdapter.getPoolStats();

    res.json({
      success: true,
      data: {
        connectionStatus,
        poolStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting database connection status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve database connection status",
    });
  }
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (req, res) => {
  try {
    const isConnected = await dbAdapter.testConnection();
    const connectionStatus = dbAdapter.getConnectionStatus();

    res.json({
      success: true,
      data: {
        isConnected,
        connectionStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error testing database connection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test database connection",
    });
  }
};

/**
 * Get database configuration
 */
export const getDatabaseConfig = async (req, res) => {
  try {
    const config = dbAdapter.getDatabaseType();
    const connectionStatus = dbAdapter.getConnectionStatus();

    res.json({
      success: true,
      data: {
        databaseType: config,
        connectionStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error getting database configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve database configuration",
    });
  }
};
