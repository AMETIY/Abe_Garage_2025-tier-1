// Enhanced database configuration with dual database support
// Supports both MySQL (local development) and PostgreSQL (production)
import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database configuration factory that supports dual database environments
 *
 * Automatically selects database type based on NODE_ENV:
 * - Development: MySQL (default)
 * - Production: PostgreSQL (default)
 * - Can be overridden with DB_TYPE environment variable
 *
 * @returns {object} Database configuration object with connection parameters
 *
 * Environment Variables Required:
 * - DB_HOST: Database host address
 * - DB_PORT: Database port number
 * - DB_NAME: Database name
 * - DB_USER: Database username
 * - DB_PASS: Database password
 * - DB_TYPE: Override database type ('mysql' or 'postgresql')
 * - DB_POOL_SIZE: Connection pool size (optional, default: 20)
 * - DB_POOL_MIN: Minimum pool connections (optional, default: 2)
 */
const getDatabaseConfig = () => {
  const environment = process.env.NODE_ENV || "development";
  const dbType =
    process.env.DB_TYPE ||
    (environment === "production" ? "postgresql" : "mysql");

  const baseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  };

  if (dbType === "postgresql") {
    return {
      type: "postgresql",
      ...baseConfig,
      port: parseInt(baseConfig.port) || 5432,

      connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 20,
      // PostgreSQL specific optimizations
      statement_timeout: 30000, // 30 seconds
      query_timeout: 30000,
      idle_in_transaction_session_timeout: 60000, // 1 minute
      // Connection pool optimizations
      max: parseInt(process.env.DB_POOL_SIZE) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      allowExitOnIdle: true,
      // Performance optimizations
      application_name: "abe_garage_app",
      // SSL configuration for production
      ssl:
        environment === "production"
          ? {
              rejectUnauthorized: false,
              ca: process.env.DB_SSL_CA,
              cert: process.env.DB_SSL_CERT,
              key: process.env.DB_SSL_KEY,
            }
          : false,
    };
  }

  // Default to MySQL configuration
  return {
    type: "mysql",
    ...baseConfig,
    port: parseInt(baseConfig.port) || 3306,
    connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 20,
    // MySQL specific optimizations
    acquireTimeout: 60000,
    connectTimeout: 60000,
    waitForConnections: true,
    queueLimit: 0,
    // Performance optimizations
    charset: "utf8mb4",
    timezone: "UTC",
    // Connection pool optimizations
    multipleStatements: false,
    namedPlaceholders: true,
  };
};

// Enhanced database adapter class with improved error handling and monitoring
class DatabaseAdapter {
  constructor() {
    this.config = getDatabaseConfig();
    this.pool = null;
    this.healthCheckInterval = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      avgResponseTime: 0,
    };
    this.slowQueryThreshold =
      parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000; // 1 second
    this.initializePool();
    this.startHealthMonitoring();
    this.startPerformanceMonitoring();
  }

  initializePool() {
    try {
      if (this.config.type === "postgresql") {
        const { Pool } = pg;
        this.pool = new Pool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          ssl: this.config.ssl,
          max: this.config.max,
          min: this.config.min,
          idleTimeoutMillis: this.config.idleTimeoutMillis,
          connectionTimeoutMillis: this.config.connectionTimeoutMillis,
          allowExitOnIdle: this.config.allowExitOnIdle,
          application_name: this.config.application_name,
          statement_timeout: this.config.statement_timeout,
          query_timeout: this.config.query_timeout,
          idle_in_transaction_session_timeout:
            this.config.idle_in_transaction_session_timeout,
        });

        // Add error handling for PostgreSQL pool
        this.pool.on("error", (err) => {
          console.error("❌ PostgreSQL pool error:", err);
          this.isConnected = false;
          this.queryStats.failedQueries++;
        });

        // Add connection event handlers
        this.pool.on("connect", (client) => {
          console.log("🔗 New PostgreSQL connection established");
          // Set session-level optimizations
          client.query("SET SESSION statement_timeout = 30000");
          client.query(
            "SET SESSION idle_in_transaction_session_timeout = 60000"
          );
        });

        this.pool.on("remove", () => {
          console.log("🔌 PostgreSQL connection removed from pool");
        });
      } else {
        // MySQL pool with enhanced configuration
        this.pool = mysql.createPool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          connectionLimit: this.config.connectionLimit,
          acquireTimeout: this.config.acquireTimeout,
          connectTimeout: this.config.connectTimeout,
          waitForConnections: this.config.waitForConnections,
          queueLimit: this.config.queueLimit,
          charset: this.config.charset,
          timezone: this.config.timezone,
          multipleStatements: this.config.multipleStatements,
          namedPlaceholders: this.config.namedPlaceholders,
        });
      }

      console.log(
        `✅ ${this.config.type.toUpperCase()} connection pool initialized with optimized settings`
      );
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.config.type} pool:`, error);
      throw error;
    }
  }

  // Enhanced query method with retry logic, performance tracking, and better error handling
  async query(sql, params = [], retries = this.maxRetries) {
    const startTime = Date.now();
    this.queryStats.totalQueries++;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        let result;

        if (this.config.type === "postgresql") {
          const pgSql = this.convertMySQLToPostgreSQL(sql);
          result = await this.pool.query(pgSql, params);
          this.isConnected = true;
          this.retryAttempts = 0;
          result = result.rows;
        } else {
          const [rows] = await this.pool.execute(sql, params);
          this.isConnected = true;
          this.retryAttempts = 0;
          result = rows;
        }

        // Track performance
        const queryTime = Date.now() - startTime;
        this.updateQueryStats(queryTime);

        // Log slow queries
        if (queryTime > this.slowQueryThreshold) {
          this.queryStats.slowQueries++;
          console.warn(`🐌 Slow query detected (${queryTime}ms):`, {
            sql: sql.replace(/\s+/g, " ").trim(),
            params: params.length > 0 ? params : undefined,
            time: queryTime,
          });
        }

        return result;
      } catch (error) {
        this.isConnected = false;
        this.retryAttempts++;
        this.queryStats.failedQueries++;

        // Log the error with context
        this.logQueryError(sql, params, error, attempt);

        if (attempt === retries) {
          // Final attempt failed, throw enhanced error
          throw this.enhanceError(error, sql, params);
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `🔄 Retrying query in ${delay}ms (attempt ${attempt}/${retries})`
        );
        await this.delay(delay);
      }
    }
  }

  // Update query statistics
  updateQueryStats(queryTime) {
    const totalQueries = this.queryStats.totalQueries;
    this.queryStats.avgResponseTime =
      (this.queryStats.avgResponseTime * (totalQueries - 1) + queryTime) /
      totalQueries;
  }

  // Enhanced query conversion with better parameter handling and PostgreSQL optimizations
  convertMySQLToPostgreSQL(sql) {
    if (this.config.type !== "postgresql") return sql;

    let pgSql = sql;

    // Convert parameter placeholders from ? to $1, $2, etc.
    let paramIndex = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

    // Convert MySQL specific syntax to PostgreSQL
    pgSql = pgSql.replace(/`/g, '"'); // Backticks to double quotes
    pgSql = pgSql.replace(/AUTO_INCREMENT/gi, "SERIAL");
    pgSql = pgSql.replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
    pgSql = pgSql.replace(/CURDATE\(\)/gi, "CURRENT_DATE");
    pgSql = pgSql.replace(/CURTIME\(\)/gi, "CURRENT_TIME");

    // Handle LIMIT/OFFSET syntax properly
    pgSql = pgSql.replace(/LIMIT (\d+) OFFSET (\d+)/gi, "LIMIT $1 OFFSET $2");

    // Handle MySQL-specific functions
    pgSql = pgSql.replace(/UUID\(\)/gi, "gen_random_uuid()");
    pgSql = pgSql.replace(/UNIX_TIMESTAMP\(\)/gi, "EXTRACT(EPOCH FROM NOW())");

    // PostgreSQL specific optimizations
    pgSql = pgSql.replace(/COUNT\(\*\)/gi, "COUNT(*)");
    pgSql = pgSql.replace(/GROUP BY/gi, "GROUP BY");

    return pgSql;
  }

  // Enhanced error logging with context and performance metrics
  logQueryError(sql, params, error, attempt = 1) {
    const errorContext = {
      timestamp: new Date().toISOString(),
      databaseType: this.config.type,
      attempt,
      sql: sql.replace(/\s+/g, " ").trim(),
      params: params.length > 0 ? params : undefined,
      error: error.message,
      code: error.code,
      host: this.config.host,
      database: this.config.database,
      poolStats: this.getPoolStats(),
    };

    console.error("❌ Database query error:", errorContext);

    // Log to file in production
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Full error context:",
        JSON.stringify(errorContext, null, 2)
      );
    }
  }

  // Enhanced error with more context and performance data
  enhanceError(error, sql, params) {
    const enhancedError = new Error(`Database query failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.sql = sql;
    enhancedError.params = params;
    enhancedError.databaseType = this.config.type;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.poolStats = this.getPoolStats();
    enhancedError.queryStats = this.queryStats;

    return enhancedError;
  }

  // Utility method for delays
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Start health monitoring with enhanced checks
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.checkPoolHealth();
    }, 30000); // Check every 30 seconds
  }

  // Start performance monitoring
  startPerformanceMonitoring() {
    try {
      this.performanceMonitoringInterval = setInterval(() => {
        this.logPerformanceStats();
      }, 60000); // Log performance stats every minute
    } catch (error) {
      console.error("❌ Error starting performance monitoring:", error.message);
    }
  }

  // Enhanced health check method with detailed diagnostics
  async checkPoolHealth() {
    try {
      const startTime = Date.now();
      await this.query("SELECT 1 as health_check");
      const responseTime = Date.now() - startTime;

      if (!this.isConnected) {
        console.log("✅ Database connection restored");
        this.isConnected = true;
      }

      // Log health check performance
      if (responseTime > 100) {
        console.warn(`⚠️ Slow health check response: ${responseTime}ms`);
      }
    } catch (error) {
      console.error("❌ Database health check failed:", error.message);
      this.isConnected = false;
      await this.reconnect();
    }
  }

  // Enhanced reconnection logic with better error handling
  async reconnect() {
    console.log("🔄 Attempting to reconnect to database...");
    try {
      await this.close();
      this.initializePool();
      await this.query("SELECT 1 as reconnect_test");
      console.log("✅ Database reconnection successful");
      this.isConnected = true;
    } catch (error) {
      console.error("❌ Database reconnection failed:", error.message);
      this.isConnected = false;
    }
  }

  // Log performance statistics
  logPerformanceStats() {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        totalQueries: this.queryStats.totalQueries,
        slowQueries: this.queryStats.slowQueries,
        failedQueries: this.queryStats.failedQueries,
        avgResponseTime: Math.round(this.queryStats.avgResponseTime),
        poolStats: this.getPoolStats(),
        isConnected: this.isConnected,
      };

      console.log("📊 Database Performance Stats:", stats);
    } catch (error) {
      console.error("❌ Error logging performance stats:", error.message);
      // Don't let performance monitoring crash the application
    }
  }

  // Get database type for conditional logic
  getDatabaseType() {
    return this.config.type;
  }

  // Get connection status with enhanced information
  getConnectionStatus() {
    try {
      return {
        isConnected: this.isConnected,
        databaseType: this.config.type,
        retryAttempts: this.retryAttempts,
        host: this.config.host,
        database: this.config.database,
        poolStats: this.getPoolStats(),
        queryStats: this.queryStats,
      };
    } catch (error) {
      console.error("❌ Error getting connection status:", error.message);
      return {
        isConnected: this.isConnected,
        databaseType: this.config.type,
        retryAttempts: this.retryAttempts,
        host: this.config.host,
        database: this.config.database,
        poolStats: null,
        queryStats: this.queryStats,
      };
    }
  }

  // Enhanced close method with proper cleanup
  async close() {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.performanceMonitoringInterval) {
        clearInterval(this.performanceMonitoringInterval);
      }

      if (this.pool) {
        try {
          if (this.config.type === "postgresql") {
            await this.pool.end();
          } else {
            await this.pool.end();
          }
          console.log("🔌 Database connection pool closed");
        } catch (error) {
          console.error("❌ Error closing database pool:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error during database close:", error.message);
    }
  }

  // Enhanced test connection with performance metrics
  async testConnection() {
    try {
      const startTime = Date.now();
      const testQuery = "SELECT 1 as test";
      const result = await this.query(testQuery);
      const responseTime = Date.now() - startTime;

      if (result && result.length > 0) {
        console.log(
          `✅ ${this.config.type.toUpperCase()} database connection successful (${responseTime}ms)`
        );
        this.isConnected = true;
        return true;
      } else {
        throw new Error("Test query returned no results");
      }
    } catch (error) {
      console.error(
        `❌ ${this.config.type.toUpperCase()} database connection failed:`,
        error.message
      );
      this.isConnected = false;
      return false;
    }
  }

  // Enhanced pool statistics with more detailed information
  getPoolStats() {
    try {
      if (!this.pool) return null;

      if (this.config.type === "postgresql") {
        return {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount,
          max: this.config.max,
          min: this.config.min,
        };
      } else {
        // MySQL2 doesn't expose pool stats easily, so we return basic config info
        return {
          connectionLimit: this.config.connectionLimit,
          databaseType: "mysql",
          // MySQL doesn't expose real-time pool stats like PostgreSQL
        };
      }
    } catch (error) {
      console.error("❌ Error getting pool stats:", error.message);
      return {
        error: "Unable to retrieve pool statistics",
        databaseType: this.config.type,
      };
    }
  }

  // Get query performance statistics
  getQueryStats() {
    return {
      ...this.queryStats,
      slowQueryThreshold: this.slowQueryThreshold,
    };
  }

  // Reset query statistics
  resetQueryStats() {
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      avgResponseTime: 0,
    };
  }
}

// Create singleton instance
const dbAdapter = new DatabaseAdapter();

// Import performance tracking
import { withPerformanceTracking } from "../services/performance.service.js";

// Export the query function with performance tracking
export const query = withPerformanceTracking((sql, params) =>
  dbAdapter.query(sql, params)
);

// Export the adapter instance and configuration for external use
export { dbAdapter, getDatabaseConfig };
