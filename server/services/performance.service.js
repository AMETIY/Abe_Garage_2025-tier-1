/**
 * Database Performance Monitoring Service
 * Provides query performance tracking, caching, and optimization utilities
 */

import { performance } from "perf_hooks";

/**
 * Query performance tracker
 */
class QueryPerformanceTracker {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.cacheEnabled = process.env.QUERY_CACHE_ENABLED === "true";
    this.cache = new Map();
    this.cacheMaxSize = 100;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Track query execution time and performance
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {Function} queryFn - Query execution function
   * @returns {Promise} Query result with performance data
   */
  async trackQuery(sql, params = [], queryFn) {
    const queryKey = this.generateQueryKey(sql, params);
    const startTime = performance.now();

    try {
      // Check cache first if enabled
      if (this.cacheEnabled && this.isSelectQuery(sql)) {
        const cachedResult = this.getFromCache(queryKey);
        if (cachedResult) {
          this.logCacheHit(sql, performance.now() - startTime);
          return cachedResult;
        }
      }

      // Execute query
      const result = await queryFn(sql, params);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Update statistics
      this.updateQueryStats(sql, duration);

      // Cache result if applicable
      if (
        this.cacheEnabled &&
        this.isSelectQuery(sql) &&
        this.shouldCache(sql)
      ) {
        this.setCache(queryKey, result);
      }

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        this.logSlowQuery(sql, params, duration);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logQueryError(sql, params, duration, error);
      throw error;
    }
  }

  /**
   * Generate cache key for query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {string} Cache key
   */
  generateQueryKey(sql, params) {
    const normalizedSql = sql.replace(/\s+/g, " ").trim().toLowerCase();
    const paramString = JSON.stringify(params);
    return `${normalizedSql}:${paramString}`;
  }

  /**
   * Check if query is a SELECT statement
   * @param {string} sql - SQL query
   * @returns {boolean} True if SELECT query
   */
  isSelectQuery(sql) {
    return sql.trim().toLowerCase().startsWith("select");
  }

  /**
   * Determine if query result should be cached
   * @param {string} sql - SQL query
   * @returns {boolean} True if should cache
   */
  shouldCache(sql) {
    const lowerSql = sql.toLowerCase();

    // Don't cache queries with time-sensitive functions
    const timeFunction = [
      "now()",
      "current_timestamp",
      "curdate()",
      "curtime()",
    ];
    if (timeFunction.some((fn) => lowerSql.includes(fn))) {
      return false;
    }

    // Don't cache queries with random functions
    if (lowerSql.includes("rand()") || lowerSql.includes("random()")) {
      return false;
    }

    return true;
  }

  /**
   * Get result from cache
   * @param {string} key - Cache key
   * @returns {any} Cached result or null
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set result in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    // Implement LRU cache behavior
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Deep clone to prevent mutations
      timestamp: Date.now(),
    });
  }

  /**
   * Update query statistics
   * @param {string} sql - SQL query
   * @param {number} duration - Query duration in ms
   */
  updateQueryStats(sql, duration) {
    const queryType = this.getQueryType(sql);
    const stats = this.queryStats.get(queryType) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      slowQueries: 0,
    };

    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);

    if (duration > this.slowQueryThreshold) {
      stats.slowQueries++;
    }

    this.queryStats.set(queryType, stats);
  }

  /**
   * Get query type from SQL
   * @param {string} sql - SQL query
   * @returns {string} Query type
   */
  getQueryType(sql) {
    const firstWord = sql.trim().split(/\s+/)[0].toLowerCase();
    return firstWord;
  }

  /**
   * Log slow query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {number} duration - Query duration
   */
  logSlowQuery(sql, params, duration) {
    console.warn("🐌 SLOW QUERY DETECTED:", {
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration)}ms`,
      sql: sql.replace(/\s+/g, " ").trim(),
      params: params.length > 0 ? params : undefined,
      threshold: `${this.slowQueryThreshold}ms`,
    });
  }

  /**
   * Log cache hit
   * @param {string} sql - SQL query
   * @param {number} duration - Cache lookup duration
   */
  logCacheHit(sql, duration) {
    if (process.env.NODE_ENV === "development") {
      console.log("💾 CACHE HIT:", {
        timestamp: new Date().toISOString(),
        duration: `${Math.round(duration)}ms`,
        sql: sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
      });
    }
  }

  /**
   * Log query error
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {number} duration - Query duration
   * @param {Error} error - Error object
   */
  logQueryError(sql, params, duration, error) {
    console.error("❌ QUERY ERROR:", {
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration)}ms`,
      sql: sql.replace(/\s+/g, " ").trim(),
      params: params.length > 0 ? params : undefined,
      error: error.message,
      code: error.code,
    });
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    const stats = {};
    for (const [queryType, data] of this.queryStats.entries()) {
      stats[queryType] = {
        ...data,
        avgTime: Math.round(data.avgTime * 100) / 100,
        minTime: Math.round(data.minTime * 100) / 100,
        maxTime: Math.round(data.maxTime * 100) / 100,
      };
    }

    return {
      queryStats: stats,
      cacheStats: {
        enabled: this.cacheEnabled,
        size: this.cache.size,
        maxSize: this.cacheMaxSize,
        hitRate: this.calculateCacheHitRate(),
      },
    };
  }

  /**
   * Calculate cache hit rate
   * @returns {number} Cache hit rate percentage
   */
  calculateCacheHitRate() {
    // This would need to be tracked separately for accurate calculation
    // For now, return estimated based on cache size
    return this.cache.size > 0
      ? Math.min(90, (this.cache.size / this.cacheMaxSize) * 100)
      : 0;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Query cache cleared");
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.queryStats.clear();
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Query statistics reset");
    }
  }
}

// Create singleton instance
const performanceTracker = new QueryPerformanceTracker();

/**
 * Enhanced query function with performance tracking
 * @param {Function} originalQueryFn - Original query function
 * @returns {Function} Enhanced query function
 */
export const withPerformanceTracking = (originalQueryFn) => {
  return async (sql, params = []) => {
    return await performanceTracker.trackQuery(sql, params, originalQueryFn);
  };
};

/**
 * Query optimization utilities
 */
export const QueryOptimizer = {
  /**
   * Optimize SELECT queries by adding appropriate indexes suggestions
   * @param {string} sql - SQL query
   * @returns {Object} Optimization suggestions
   */
  analyzeQuery(sql) {
    const suggestions = [];
    const lowerSql = sql.toLowerCase();

    // Check for missing WHERE clause in SELECT
    if (
      lowerSql.includes("select") &&
      !lowerSql.includes("where") &&
      !lowerSql.includes("limit")
    ) {
      suggestions.push({
        type: "warning",
        message:
          "Consider adding WHERE clause or LIMIT to avoid full table scan",
      });
    }

    // Check for SELECT *
    if (lowerSql.includes("select *")) {
      suggestions.push({
        type: "optimization",
        message: "Consider selecting only needed columns instead of SELECT *",
      });
    }

    // Check for ORDER BY without LIMIT
    if (lowerSql.includes("order by") && !lowerSql.includes("limit")) {
      suggestions.push({
        type: "performance",
        message: "ORDER BY without LIMIT may be expensive on large datasets",
      });
    }

    // Check for multiple JOINs
    const joinCount = (lowerSql.match(/join/g) || []).length;
    if (joinCount > 3) {
      suggestions.push({
        type: "performance",
        message: `Query has ${joinCount} JOINs, consider optimizing or breaking into smaller queries`,
      });
    }

    return {
      query: sql,
      suggestions,
      complexity: this.calculateComplexity(sql),
    };
  },

  /**
   * Calculate query complexity score
   * @param {string} sql - SQL query
   * @returns {number} Complexity score (1-10)
   */
  calculateComplexity(sql) {
    const lowerSql = sql.toLowerCase();
    let complexity = 1;

    // Add complexity for JOINs
    const joinCount = (lowerSql.match(/join/g) || []).length;
    complexity += joinCount * 0.5;

    // Add complexity for subqueries
    const subqueryCount = (lowerSql.match(/\(/g) || []).length;
    complexity += subqueryCount * 0.3;

    // Add complexity for aggregations
    const aggregations = ["count", "sum", "avg", "max", "min", "group by"];
    aggregations.forEach((agg) => {
      if (lowerSql.includes(agg)) complexity += 0.2;
    });

    // Add complexity for HAVING, UNION, etc.
    const complexOperations = ["having", "union", "exists", "in (select"];
    complexOperations.forEach((op) => {
      if (lowerSql.includes(op)) complexity += 0.3;
    });

    return Math.min(10, Math.round(complexity * 10) / 10);
  },
};

// Export the performance tracker instance and utilities
export { performanceTracker };

/**
 * Middleware to add performance tracking to database queries
 * @param {Function} queryFunction - Original query function
 * @returns {Function} Enhanced query function with performance tracking
 */
export const enhanceQueryWithPerformance = (queryFunction) => {
  return withPerformanceTracking(queryFunction);
};
