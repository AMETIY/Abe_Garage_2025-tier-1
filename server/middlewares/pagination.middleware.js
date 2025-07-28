/**
 * Pagination Middleware
 * Provides consistent pagination handling for API endpoints
 */

import { validatePaginationParams } from "../services/pagination.service.js";
import ApiError from "../utils/ApiError.js";

/**
 * Pagination middleware to parse and validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const paginationMiddleware = (req, res, next) => {
  try {
    // Extract pagination parameters from query string
    const paginationParams = validatePaginationParams(req.query);

    // Attach validated pagination parameters to request object
    req.pagination = paginationParams;

    next();
  } catch (error) {
    next(
      ApiError.validation("Invalid pagination parameters", {
        originalError: error.message,
      })
    );
  }
};

/**
 * Enhanced pagination middleware with custom limits
 * @param {Object} options - Configuration options
 * @param {number} options.defaultLimit - Default items per page
 * @param {number} options.maxLimit - Maximum items per page
 * @param {Array} options.allowedSortFields - Allowed fields for sorting
 * @returns {Function} Middleware function
 */
export const createPaginationMiddleware = (options = {}) => {
  const { defaultLimit = 10, maxLimit = 100, allowedSortFields = [] } = options;

  return (req, res, next) => {
    try {
      const { page, limit, sort, order } = req.query;

      // Validate and set pagination parameters
      const currentPage = Math.max(1, parseInt(page) || 1);
      const itemsPerPage = Math.max(
        1,
        Math.min(maxLimit, parseInt(limit) || defaultLimit)
      );
      const offset = (currentPage - 1) * itemsPerPage;

      // Validate sort field if provided
      let sortField = null;
      let sortOrder = "desc";

      if (sort) {
        if (allowedSortFields.length > 0 && !allowedSortFields.includes(sort)) {
          throw new Error(
            `Invalid sort field. Allowed fields: ${allowedSortFields.join(
              ", "
            )}`
          );
        }
        sortField = sort;
      }

      if (order && ["asc", "desc"].includes(order.toLowerCase())) {
        sortOrder = order.toLowerCase();
      }

      // Attach pagination data to request
      req.pagination = {
        page: currentPage,
        limit: itemsPerPage,
        offset,
        sort: sortField,
        order: sortOrder,
      };

      next();
    } catch (error) {
      next(
        ApiError.validation("Invalid pagination parameters", {
          originalError: error.message,
        })
      );
    }
  };
};

/**
 * Middleware to add pagination response helper to res object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const paginationResponseMiddleware = (req, res, next) => {
  /**
   * Send paginated response
   * @param {Array} data - Response data
   * @param {number} totalItems - Total number of items
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  res.sendPaginated = (
    data,
    totalItems,
    message = "Data retrieved successfully",
    statusCode = 200
  ) => {
    const { page, limit } = req.pagination;
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    const response = {
      status: "success",
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  };

  next();
};

/**
 * Middleware for filtering support
 * @param {Array} allowedFilters - Array of allowed filter fields
 * @returns {Function} Middleware function
 */
export const createFilterMiddleware = (allowedFilters = []) => {
  return (req, res, next) => {
    const filters = {};

    // Extract filter parameters from query
    Object.keys(req.query).forEach((key) => {
      if (key.startsWith("filter_") || allowedFilters.includes(key)) {
        const filterKey = key.startsWith("filter_") ? key.substring(7) : key;

        if (allowedFilters.length === 0 || allowedFilters.includes(filterKey)) {
          filters[filterKey] = req.query[key];
        }
      }
    });

    // Attach filters to request
    req.filters = filters;

    next();
  };
};

/**
 * Search middleware for text-based searching
 * @param {Array} searchableFields - Fields that can be searched
 * @returns {Function} Middleware function
 */
export const createSearchMiddleware = (searchableFields = []) => {
  return (req, res, next) => {
    const { search, searchField } = req.query;

    if (search) {
      const searchTerm = search.toString().trim();

      if (searchTerm.length > 0) {
        let fieldsToSearch = searchableFields;

        // If specific field is specified, validate it
        if (searchField && searchableFields.includes(searchField)) {
          fieldsToSearch = [searchField];
        }

        req.search = {
          term: searchTerm,
          fields: fieldsToSearch,
        };
      }
    }

    next();
  };
};
