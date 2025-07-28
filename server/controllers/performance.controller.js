/**
 * Performance Controller
 * Provides real-time performance metrics and system health data
 */

import { performance } from "perf_hooks";
import os from "os";
import { performanceTracker } from "../services/performance.service.js";
import { dbAdapter } from "../config/database.config.js";

/**
 * Get comprehensive performance metrics
 */
export const getPerformanceMetrics = async (req, res) => {
  try {
    const startTime = performance.now();

    // Get database performance metrics
    const dbMetrics = await getDatabaseMetrics();

    // Get API performance metrics
    const apiMetrics = await getAPIMetrics();

    // Get system resource metrics
    const systemMetrics = await getSystemMetrics();

    // Get network performance metrics
    const networkMetrics = await getNetworkMetrics();

    // Generate performance alerts
    const alerts = generatePerformanceAlerts({
      database: dbMetrics,
      api: apiMetrics,
      system: systemMetrics,
      network: networkMetrics,
    });

    // Generate recommendations
    const recommendations = generateRecommendations({
      database: dbMetrics,
      api: apiMetrics,
      system: systemMetrics,
      network: networkMetrics,
    });

    const responseTime = performance.now() - startTime;

    res.json({
      status: "success",
      data: {
        database: dbMetrics,
        api: apiMetrics,
        system: systemMetrics,
        network: networkMetrics,
        alerts,
        recommendations,
        responseTime,
      },
    });
  } catch (error) {
    console.error("Performance metrics error:", error);
    res.status(500).json({
      status: "error",
      error: {
        message: "Failed to fetch performance metrics",
      },
    });
  }
};

/**
 * Get database performance metrics
 */
async function getDatabaseMetrics() {
  try {
    const stats = performanceTracker.getStats();
    const cacheStats = performanceTracker.calculateCacheHitRate();

    // Get active connections (simulated)
    const activeConnections = Math.floor(Math.random() * 10) + 5;

    // Calculate average query time
    const queryTimes = Array.from(stats.queryStats.values());
    const averageQueryTime =
      queryTimes.length > 0
        ? Math.round(
            queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length
          )
        : 0;

    // Determine status based on performance
    let status = "Excellent";
    if (averageQueryTime > 200) status = "Poor";
    else if (averageQueryTime > 100) status = "Fair";
    else if (averageQueryTime > 50) status = "Good";

    return {
      averageQueryTime,
      activeConnections,
      cacheHitRate: Math.round(cacheStats * 100),
      slowQueries: stats.slowQueries || 0,
      status,
      totalQueries: stats.totalQueries || 0,
      cacheEnabled: performanceTracker.cacheEnabled,
    };
  } catch (error) {
    console.error("Database metrics error:", error);
    return {
      averageQueryTime: 0,
      activeConnections: 0,
      cacheHitRate: 0,
      slowQueries: 0,
      status: "Unknown",
      totalQueries: 0,
      cacheEnabled: false,
    };
  }
}

/**
 * Get API performance metrics
 */
async function getAPIMetrics() {
  try {
    // Simulate API metrics (in real implementation, these would come from actual monitoring)
    const averageResponseTime = Math.floor(Math.random() * 300) + 50;
    const requestsPerMinute = Math.floor(Math.random() * 100) + 20;
    const errorRate = Math.random() * 5; // 0-5%
    const activeEndpoints = 15; // Number of API endpoints

    let status = "Excellent";
    if (averageResponseTime > 1000) status = "Poor";
    else if (averageResponseTime > 500) status = "Fair";
    else if (averageResponseTime > 200) status = "Good";

    return {
      averageResponseTime,
      requestsPerMinute,
      errorRate: Math.round(errorRate * 100) / 100,
      activeEndpoints,
      status,
    };
  } catch (error) {
    console.error("API metrics error:", error);
    return {
      averageResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      activeEndpoints: 0,
      status: "Unknown",
    };
  }
}

/**
 * Get system resource metrics
 */
async function getSystemMetrics() {
  try {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = Math.round(
      ((totalMemory - freeMemory) / totalMemory) * 100
    );

    // Simulate CPU usage (in real implementation, use actual CPU monitoring)
    const cpuUsage = Math.floor(Math.random() * 30) + 20; // 20-50%

    // Simulate disk usage
    const diskUsage = Math.floor(Math.random() * 20) + 60; // 60-80%

    // Calculate uptime
    const uptimeSeconds = os.uptime();
    const uptime = formatUptime(uptimeSeconds);

    return {
      memoryUsage,
      cpuUsage,
      diskUsage,
      uptime,
      totalMemory: Math.round(totalMemory / (1024 * 1024 * 1024)), // GB
      freeMemory: Math.round(freeMemory / (1024 * 1024 * 1024)), // GB
    };
  } catch (error) {
    console.error("System metrics error:", error);
    return {
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      uptime: "Unknown",
      totalMemory: 0,
      freeMemory: 0,
    };
  }
}

/**
 * Get network performance metrics
 */
async function getNetworkMetrics() {
  try {
    // Simulate network metrics (in real implementation, these would come from actual monitoring)
    const bandwidthUsage = Math.floor(Math.random() * 50) + 10; // 10-60 Mbps
    const latency = Math.floor(Math.random() * 150) + 20; // 20-170ms
    const packetLoss = Math.random() * 2; // 0-2%
    const activeConnections = Math.floor(Math.random() * 50) + 10; // 10-60 connections

    return {
      bandwidthUsage,
      latency,
      packetLoss: Math.round(packetLoss * 100) / 100,
      activeConnections,
    };
  } catch (error) {
    console.error("Network metrics error:", error);
    return {
      bandwidthUsage: 0,
      latency: 0,
      packetLoss: 0,
      activeConnections: 0,
    };
  }
}

/**
 * Generate performance alerts based on metrics
 */
function generatePerformanceAlerts(metrics) {
  const alerts = [];

  // Database alerts
  if (metrics.database.averageQueryTime > 200) {
    alerts.push({
      title: "High Database Query Time",
      message: `Average query time is ${metrics.database.averageQueryTime}ms, which is above the recommended threshold.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
    });
  }

  if (metrics.database.slowQueries > 5) {
    alerts.push({
      title: "Multiple Slow Queries Detected",
      message: `${metrics.database.slowQueries} slow queries detected. Consider optimizing database queries.`,
      severity: "critical",
      timestamp: new Date().toISOString(),
    });
  }

  // System alerts
  if (metrics.system.memoryUsage > 85) {
    alerts.push({
      title: "High Memory Usage",
      message: `Memory usage is at ${metrics.system.memoryUsage}%. Consider restarting the application or optimizing memory usage.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
    });
  }

  if (metrics.system.cpuUsage > 80) {
    alerts.push({
      title: "High CPU Usage",
      message: `CPU usage is at ${metrics.system.cpuUsage}%. This may impact application performance.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
    });
  }

  // API alerts
  if (metrics.api.averageResponseTime > 500) {
    alerts.push({
      title: "Slow API Response Time",
      message: `Average API response time is ${metrics.api.averageResponseTime}ms, which is above the recommended threshold.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
    });
  }

  if (metrics.api.errorRate > 3) {
    alerts.push({
      title: "High API Error Rate",
      message: `API error rate is ${metrics.api.errorRate}%. Investigate and fix the underlying issues.`,
      severity: "critical",
      timestamp: new Date().toISOString(),
    });
  }

  return alerts;
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(metrics) {
  const recommendations = [];

  // Database recommendations
  if (metrics.database.averageQueryTime > 100) {
    recommendations.push("Optimize database queries by adding proper indexes");
  }

  if (metrics.database.cacheHitRate < 70) {
    recommendations.push(
      "Implement query caching for frequently accessed data"
    );
  }

  if (metrics.database.slowQueries > 0) {
    recommendations.push("Review and optimize slow database queries");
  }

  // System recommendations
  if (metrics.system.memoryUsage > 80) {
    recommendations.push(
      "Monitor memory usage and consider implementing memory optimization"
    );
  }

  if (metrics.system.cpuUsage > 70) {
    recommendations.push(
      "Consider scaling the application or optimizing CPU-intensive operations"
    );
  }

  // API recommendations
  if (metrics.api.averageResponseTime > 300) {
    recommendations.push(
      "Implement API response caching and optimize backend operations"
    );
  }

  if (metrics.api.errorRate > 1) {
    recommendations.push(
      "Implement better error handling and monitoring for API endpoints"
    );
  }

  // General recommendations
  recommendations.push("Set up automated performance monitoring and alerting");
  recommendations.push("Implement connection pooling for database connections");
  recommendations.push("Consider implementing rate limiting for API endpoints");

  return recommendations;
}

/**
 * Format uptime in a human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get performance history (for charts)
 */
export const getPerformanceHistory = async (req, res) => {
  try {
    const { period = "24h" } = req.query;

    // In a real implementation, this would fetch historical data from a database
    const history = generateMockHistory(period);

    res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    console.error("Performance history error:", error);
    res.status(500).json({
      status: "error",
      error: {
        message: "Failed to fetch performance history",
      },
    });
  }
};

/**
 * Generate mock performance history data
 */
function generateMockHistory(period) {
  const now = new Date();
  const dataPoints = period === "24h" ? 24 : period === "7d" ? 7 : 30;
  const interval =
    period === "24h" ? 3600000 : period === "7d" ? 86400000 : 86400000; // 1h, 1d, 1d

  const history = [];

  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval);

    history.push({
      timestamp: timestamp.toISOString(),
      database: {
        averageQueryTime: Math.floor(Math.random() * 100) + 20,
        activeConnections: Math.floor(Math.random() * 10) + 5,
      },
      api: {
        averageResponseTime: Math.floor(Math.random() * 200) + 50,
        requestsPerMinute: Math.floor(Math.random() * 80) + 20,
      },
      system: {
        memoryUsage: Math.floor(Math.random() * 30) + 50,
        cpuUsage: Math.floor(Math.random() * 40) + 20,
      },
    });
  }

  return history;
}
