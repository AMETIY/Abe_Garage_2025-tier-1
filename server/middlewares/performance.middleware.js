import { asyncHandler } from "./errorHandler.middleware.js";

// Performance monitoring middleware
export const performanceMonitor = asyncHandler(async (req, res, next) => {
  const start = Date.now();

  // Add performance headers
  res.setHeader("X-Response-Time", "0ms");
  res.setHeader("X-Request-ID", generateRequestId());

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    res.setHeader("X-Response-Time", `${duration}ms`);

    // Log slow requests (over 1 second)
    if (duration > 1000) {
      console.log(`🐌 SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
    }

    // Log performance metrics
    console.log(`📊 PERFORMANCE: ${req.method} ${req.path} - ${duration}ms`);

    originalEnd.call(this, chunk, encoding);
  };

  next();
});

// Database query performance monitoring
export const queryPerformanceMonitor = (query, params = []) => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    query(params)
      .then((result) => {
        const duration = Date.now() - start;

        // Log slow queries (over 500ms)
        if (duration > 500) {
          console.log(
            `🐌 SLOW QUERY: ${duration}ms - ${query.substring(0, 100)}...`
          );
        }

        // Log all query performance
        console.log(`📊 QUERY PERFORMANCE: ${duration}ms`);

        resolve(result);
      })
      .catch((error) => {
        const duration = Date.now() - start;
        console.log(`❌ QUERY ERROR: ${duration}ms - ${error.message}`);
        reject(error);
      });
  });
};

// Memory usage monitoring
export const memoryMonitor = () => {
  const used = process.memoryUsage();

  console.log(`💾 MEMORY USAGE:
    RSS: ${Math.round((used.rss / 1024 / 1024) * 100) / 100} MB
    Heap Total: ${Math.round((used.heapTotal / 1024 / 1024) * 100) / 100} MB
    Heap Used: ${Math.round((used.heapUsed / 1024 / 1024) * 100) / 100} MB
    External: ${Math.round((used.external / 1024 / 1024) * 100) / 100} MB`);
};

// Generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cache middleware for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (key, ttl = CACHE_TTL) => {
  return asyncHandler(async (req, res, next) => {
    const cacheKey = `${key}_${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`⚡ CACHE HIT: ${cacheKey}`);
      return res.json(cached.data);
    }

    // Store original res.json to intercept
    const originalJson = res.json;
    res.json = function (data) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      console.log(`💾 CACHE SET: ${cacheKey}`);
      return originalJson.call(this, data);
    };

    next();
  });
};

// Clean up expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

// All functions are exported as named exports above
