/**
 * Database Monitoring Service
 * Provides real-time database monitoring, query analysis, and performance insights
 */

import { performance } from "perf_hooks";
import { dbAdapter } from "../config/database.config.js";

class DatabaseMonitor {
  constructor() {
    this.monitoringEnabled = process.env.DB_MONITORING_ENABLED !== "false";
    this.metrics = {
      queries: {
        total: 0,
        slow: 0,
        failed: 0,
        cached: 0,
      },
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        totalResponseTime: 0,
      },
      connections: {
        active: 0,
        idle: 0,
        total: 0,
      },
      errors: {
        connection: 0,
        query: 0,
        timeout: 0,
      },
    };
    this.queryHistory = [];
    this.maxHistorySize = 1000;
    this.slowQueryThreshold =
      parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000;
    this.startMonitoring();
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    if (!this.monitoringEnabled) return;

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Database monitoring started");
    }
  }

  /**
   * Collect real-time metrics
   */
  async collectMetrics() {
    try {
      const connectionStatus = dbAdapter.getConnectionStatus();
      const poolStats = dbAdapter.getPoolStats();
      const queryStats = dbAdapter.getQueryStats();

      // Update connection metrics
      if (poolStats) {
        this.metrics.connections = {
          active: poolStats.totalCount - poolStats.idleCount || 0,
          idle: poolStats.idleCount || 0,
          total: poolStats.totalCount || 0,
        };
      }

      // Update query metrics
      if (queryStats) {
        this.metrics.queries = {
          total: queryStats.totalQueries || 0,
          slow: queryStats.slowQueries || 0,
          failed: queryStats.failedQueries || 0,
          cached: 0, // Will be updated by cache service
        };

        this.metrics.performance = {
          avgResponseTime: queryStats.avgResponseTime || 0,
          maxResponseTime: Math.max(
            this.metrics.performance.maxResponseTime,
            queryStats.avgResponseTime || 0
          ),
          minResponseTime: Math.min(
            this.metrics.performance.minResponseTime,
            queryStats.avgResponseTime || Infinity
          ),
          totalResponseTime:
            this.metrics.performance.totalResponseTime +
            (queryStats.avgResponseTime || 0),
        };
      }

      // Log metrics if significant changes detected
      this.logMetricsIfSignificant();
    } catch (error) {
      console.error("❌ Error collecting database metrics:", error.message);
    }
  }

  /**
   * Track query execution
   */
  trackQuery(sql, params = [], startTime) {
    if (!this.monitoringEnabled) return;

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Update metrics
    this.metrics.queries.total++;
    this.metrics.performance.totalResponseTime += duration;

    if (duration > this.slowQueryThreshold) {
      this.metrics.queries.slow++;
    }

    // Store in history
    this.addToHistory({
      timestamp: new Date(),
      sql: sql.replace(/\s+/g, " ").trim(),
      params: params.length > 0 ? params : undefined,
      duration,
      isSlow: duration > this.slowQueryThreshold,
    });

    // Update performance metrics
    this.updatePerformanceMetrics(duration);
  }

  /**
   * Track query error
   */
  trackQueryError(sql, params, duration, error) {
    if (!this.monitoringEnabled) return;

    this.metrics.queries.failed++;
    this.metrics.errors.query++;

    // Add to history
    this.addToHistory({
      timestamp: new Date(),
      sql: sql.replace(/\s+/g, " ").trim(),
      params: params.length > 0 ? params : undefined,
      duration,
      error: error.message,
      isError: true,
    });
  }

  /**
   * Add query to history
   */
  addToHistory(queryInfo) {
    this.queryHistory.unshift(queryInfo);

    // Keep history size manageable
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory = this.queryHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(duration) {
    const { performance } = this.metrics;
    const totalQueries = this.metrics.queries.total;

    performance.avgResponseTime = performance.totalResponseTime / totalQueries;
    performance.maxResponseTime = Math.max(
      performance.maxResponseTime,
      duration
    );
    performance.minResponseTime = Math.min(
      performance.minResponseTime,
      duration
    );
  }

  /**
   * Log metrics if significant changes detected
   */
  logMetricsIfSignificant() {
    const { queries, performance, connections } = this.metrics;

    // Log if error rate is high
    if (queries.total > 0 && queries.failed / queries.total > 0.1) {
      console.warn("⚠️ High database error rate detected:", {
        failed: queries.failed,
        total: queries.total,
        rate: `${((queries.failed / queries.total) * 100).toFixed(2)}%`,
      });
    }

    // Log if slow query rate is high
    if (queries.total > 0 && queries.slow / queries.total > 0.2) {
      console.warn("🐌 High slow query rate detected:", {
        slow: queries.slow,
        total: queries.total,
        rate: `${((queries.slow / queries.total) * 100).toFixed(2)}%`,
      });
    }

    // Log if average response time is high
    if (performance.avgResponseTime > 500) {
      console.warn("⏱️ High average response time:", {
        avgResponseTime: `${Math.round(performance.avgResponseTime)}ms`,
        threshold: "500ms",
      });
    }

    // Log connection pool issues
    if (connections.total > 0 && connections.active / connections.total > 0.8) {
      console.warn("🔗 High connection pool usage:", {
        active: connections.active,
        total: connections.total,
        usage: `${((connections.active / connections.total) * 100).toFixed(
          2
        )}%`,
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      health: this.getHealthStatus(),
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const { queries, performance, connections } = this.metrics;

    const health = {
      status: "healthy",
      score: 100,
      issues: [],
    };

    // Check error rate
    if (queries.total > 0) {
      const errorRate = (queries.failed / queries.total) * 100;
      if (errorRate > 10) {
        health.status = "degraded";
        health.score -= 30;
        health.issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
      }
    }

    // Check slow query rate
    if (queries.total > 0) {
      const slowRate = (queries.slow / queries.total) * 100;
      if (slowRate > 20) {
        health.status = "degraded";
        health.score -= 20;
        health.issues.push(`High slow query rate: ${slowRate.toFixed(2)}%`);
      }
    }

    // Check response time
    if (performance.avgResponseTime > 500) {
      health.status = "degraded";
      health.score -= 15;
      health.issues.push(
        `High average response time: ${Math.round(
          performance.avgResponseTime
        )}ms`
      );
    }

    // Check connection pool
    if (connections.total > 0) {
      const poolUsage = (connections.active / connections.total) * 100;
      if (poolUsage > 80) {
        health.status = "degraded";
        health.score -= 10;
        health.issues.push(
          `High connection pool usage: ${poolUsage.toFixed(2)}%`
        );
      }
    }

    if (health.score < 50) {
      health.status = "critical";
    }

    return health;
  }

  /**
   * Get uptime
   */
  getUptime() {
    return process.uptime();
  }

  /**
   * Get query history
   */
  getQueryHistory(limit = 50) {
    return this.queryHistory.slice(0, limit);
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit = 20) {
    return this.queryHistory.filter((query) => query.isSlow).slice(0, limit);
  }

  /**
   * Get failed queries
   */
  getFailedQueries(limit = 20) {
    return this.queryHistory.filter((query) => query.isError).slice(0, limit);
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getMetrics();
    const health = metrics.health;

    return {
      summary: {
        status: health.status,
        score: health.score,
        uptime: `${Math.round(metrics.uptime / 3600)}h ${Math.round(
          (metrics.uptime % 3600) / 60
        )}m`,
        totalQueries: metrics.queries.total,
        avgResponseTime: `${Math.round(metrics.performance.avgResponseTime)}ms`,
      },
      details: {
        queries: metrics.queries,
        performance: metrics.performance,
        connections: metrics.connections,
        errors: metrics.errors,
      },
      issues: health.issues,
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate recommendations based on metrics
   */
  generateRecommendations() {
    const recommendations = [];
    const { queries, performance, connections } = this.metrics;

    // High error rate
    if (queries.total > 0 && queries.failed / queries.total > 0.1) {
      recommendations.push({
        priority: "high",
        category: "reliability",
        message:
          "High query error rate detected. Review database connection stability and query syntax.",
        action: "Check database logs and connection pool configuration",
      });
    }

    // High slow query rate
    if (queries.total > 0 && queries.slow / queries.total > 0.2) {
      recommendations.push({
        priority: "high",
        category: "performance",
        message:
          "High slow query rate detected. Consider query optimization and indexing.",
        action: "Analyze slow queries and add appropriate database indexes",
      });
    }

    // High response time
    if (performance.avgResponseTime > 500) {
      recommendations.push({
        priority: "medium",
        category: "performance",
        message:
          "High average response time. Consider query optimization or caching.",
        action: "Implement query caching and optimize complex queries",
      });
    }

    // High connection pool usage
    if (connections.total > 0 && connections.active / connections.total > 0.8) {
      recommendations.push({
        priority: "medium",
        category: "capacity",
        message:
          "High connection pool usage. Consider increasing pool size or optimizing connection management.",
        action:
          "Increase connection pool size or implement connection pooling optimization",
      });
    }

    return recommendations;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      if (process.env.NODE_ENV === "development") {
        console.log("📊 Database monitoring stopped");
      }
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      queries: { total: 0, slow: 0, failed: 0, cached: 0 },
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        totalResponseTime: 0,
      },
      connections: { active: 0, idle: 0, total: 0 },
      errors: { connection: 0, query: 0, timeout: 0 },
    };
    this.queryHistory = [];
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Database metrics reset");
    }
  }
}

// Create singleton instance
const databaseMonitor = new DatabaseMonitor();

// Export monitoring functions
export const trackQuery = (sql, params, startTime) => {
  databaseMonitor.trackQuery(sql, params, startTime);
};

export const trackQueryError = (sql, params, duration, error) => {
  databaseMonitor.trackQueryError(sql, params, duration, error);
};

export const getDatabaseMetrics = () => databaseMonitor.getMetrics();
export const getDatabaseReport = () => databaseMonitor.generateReport();
export const getQueryHistory = (limit) =>
  databaseMonitor.getQueryHistory(limit);
export const getSlowQueries = (limit) => databaseMonitor.getSlowQueries(limit);
export const getFailedQueries = (limit) =>
  databaseMonitor.getFailedQueries(limit);
export const resetDatabaseMetrics = () => databaseMonitor.resetMetrics();

export default databaseMonitor;
