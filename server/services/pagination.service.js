/**
 * Pagination Service
 * Provides reusable pagination functionality with offset/limit calculations
 * and consistent response formatting
 */

/**
 * Calculate pagination parameters
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Pagination parameters
 */
export const calculatePagination = (page = 1, limit = 10) => {
  // Ensure page and limit are positive integers
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page

  // Calculate offset for SQL queries
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    page: currentPage,
    limit: itemsPerPage,
    offset,
  };
};

/**
 * Generate pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const generatePaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
};

/**
 * Create paginated SQL query with count
 * @param {string} baseQuery - Base SQL query without LIMIT/OFFSET
 * @param {number} limit - Items per page
 * @param {number} offset - Offset for pagination
 * @returns {Object} Paginated query and count query
 */
export const createPaginatedQuery = (baseQuery, limit, offset) => {
  const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`;

  return {
    paginatedQuery,
    countQuery,
  };
};

/**
 * Execute paginated database query
 * @param {Function} queryFn - Database query function
 * @param {string} baseQuery - Base SQL query
 * @param {Array} queryParams - Query parameters
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results with metadata
 */
export const executePaginatedQuery = async (
  queryFn,
  baseQuery,
  queryParams = [],
  page = 1,
  limit = 10
) => {
  const {
    page: currentPage,
    limit: itemsPerPage,
    offset,
  } = calculatePagination(page, limit);
  const { paginatedQuery, countQuery } = createPaginatedQuery(
    baseQuery,
    itemsPerPage,
    offset
  );

  try {
    // Execute both queries in parallel
    const [data, countResult] = await Promise.all([
      queryFn(paginatedQuery, queryParams),
      queryFn(countQuery, queryParams),
    ]);

    const totalItems = countResult[0]?.total || 0;
    const pagination = generatePaginationMeta(
      totalItems,
      currentPage,
      itemsPerPage
    );

    return {
      data,
      pagination,
      success: true,
    };
  } catch (error) {
    throw new Error(`Pagination query failed: ${error.message}`);
  }
};

/**
 * Format paginated response
 * @param {Array} data - Query results
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Object} Formatted response
 */
export const formatPaginatedResponse = (
  data,
  pagination,
  message = "Data retrieved successfully"
) => {
  return {
    status: "success",
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validate pagination parameters from request
 * @param {Object} query - Request query parameters
 * @returns {Object} Validated pagination parameters
 */
export const validatePaginationParams = (query) => {
  const { page, limit, sort, order } = query;

  const validatedParams = calculatePagination(page, limit);

  // Validate sort parameters if provided
  if (sort) {
    validatedParams.sort = sort.toString().trim();
  }

  if (order && ["asc", "desc"].includes(order.toLowerCase())) {
    validatedParams.order = order.toLowerCase();
  } else {
    validatedParams.order = "desc"; // Default to descending
  }

  return validatedParams;
};
