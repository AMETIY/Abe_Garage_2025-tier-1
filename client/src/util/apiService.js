import ErrorHandler from "./ErrorHandler";

/**
 * Enhanced API Service with centralized error handling
 * Provides consistent error handling across all API calls
 */
class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get authorization headers with token
   * @param {string} token - JWT token
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders(token) {
    return {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Handle fetch response and errors
   * @param {Response} response - Fetch response object
   * @param {Object} context - Additional context for error handling
   * @returns {Promise} Parsed response or throws formatted error
   */
  async handleResponse(response, context = {}) {
    try {
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = {
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || errorData.error || response.statusText,
          data: errorData,
        };

        throw ErrorHandler.handleApiError(error, context);
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      // If it's already a formatted error, re-throw it
      if (error.type && error.severity) {
        throw error;
      }

      // Handle network or parsing errors
      throw ErrorHandler.handleApiError(error, context);
    }
  }

  /**
   * Generic GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async get(endpoint, options = {}) {
    const { headers = {}, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: { ...this.defaultHeaders, ...headers },
        ...fetchOptions,
      });

      return await this.handleResponse(response, {
        method: "GET",
        endpoint,
        ...options.context,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async post(endpoint, data = {}, options = {}) {
    const { headers = {}, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: { ...this.defaultHeaders, ...headers },
        body: JSON.stringify(data),
        ...fetchOptions,
      });

      return await this.handleResponse(response, {
        method: "POST",
        endpoint,
        data,
        ...options.context,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async put(endpoint, data = {}, options = {}) {
    const { headers = {}, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: { ...this.defaultHeaders, ...headers },
        body: JSON.stringify(data),
        ...fetchOptions,
      });

      return await this.handleResponse(response, {
        method: "PUT",
        endpoint,
        data,
        ...options.context,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generic DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async delete(endpoint, options = {}) {
    const { headers = {}, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: { ...this.defaultHeaders, ...headers },
        ...fetchOptions,
      });

      return await this.handleResponse(response, {
        method: "DELETE",
        endpoint,
        ...options.context,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticated GET request
   * @param {string} endpoint - API endpoint
   * @param {string} token - JWT token
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async authenticatedGet(endpoint, token, options = {}) {
    return this.get(endpoint, {
      ...options,
      headers: { ...this.getAuthHeaders(token), ...options.headers },
    });
  }

  /**
   * Authenticated POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {string} token - JWT token
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async authenticatedPost(endpoint, data, token, options = {}) {
    return this.post(endpoint, data, {
      ...options,
      headers: { ...this.getAuthHeaders(token), ...options.headers },
    });
  }

  /**
   * Authenticated PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {string} token - JWT token
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async authenticatedPut(endpoint, data, token, options = {}) {
    return this.put(endpoint, data, {
      ...options,
      headers: { ...this.getAuthHeaders(token), ...options.headers },
    });
  }

  /**
   * Authenticated DELETE request
   * @param {string} endpoint - API endpoint
   * @param {string} token - JWT token
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  async authenticatedDelete(endpoint, token, options = {}) {
    return this.delete(endpoint, {
      ...options,
      headers: { ...this.getAuthHeaders(token), ...options.headers },
    });
  }
}

// Create and export a default instance
const apiService = new ApiService();
export default apiService;
