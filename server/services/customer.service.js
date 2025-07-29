import { query } from "../config/db.config.js";
// Import bcrypt for password hashing using ES6 default import syntax
import bcrypt from "bcrypt";

// Function to add a new customer
async function addCustomer(email, phoneNumber, firstName, lastName, status) {
  try {
    // Generate a hashed value for customer security
    const customerHash = await bcrypt.hash(email, 10);

    // Insert into `customer_identifier`
    const customerResult = await query(
      `INSERT INTO customer_identifier (customer_email, customer_phone_number, customer_hash)
       VALUES (?, ?, ?)`,
      [email, phoneNumber, customerHash]
    );

    const customerId = customerResult.insertId; // Get newly inserted customer_id

    // Insert into `customer_info`
    await query(
      `INSERT INTO customer_info (customer_id, customer_first_name, customer_last_name, active_customer_status)
       VALUES (?, ?, ?, ?)`,
      [customerId, firstName, lastName, status]
    );

    return { success: true, customerId };
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
}

// Function to check if a customer already exists
async function getCustomerByEmail(email) {
  try {
    const rows = await query(
      "SELECT * FROM customer_identifier WHERE customer_email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}

/**
 * Retrieves customers with pagination, filtering, and search functionality
 * 
 * @param {number} page - Page number (1-based, default: 1)
 * @param {number} limit - Number of items per page (default: 10)
 * @param {object} filters - Filter criteria object
 * @param {boolean} filters.active - Filter by active customer status (true/false)
 * @param {object} search - Search configuration object
 * @param {string} search.term - Search term to match against
 * @param {string[]} search.fields - Fields to search in ['name', 'email', 'phone']
 * 
 * @returns {Promise<object>} Object containing:
 *   - data: Array of customer objects with contact and status information
 *   - pagination: Pagination metadata (currentPage, totalPages, totalItems, etc.)
 * 
 * @throws {Error} Database connection or query errors
 * 
 * @example
 * // Get active customers only
 * const activeCustomers = await getCustomers(1, 10, { active: true });
 * 
 * // Search customers by email
 * const emailSearch = await getCustomers(1, 10, {}, {
 *   term: 'john@example.com',
 *   fields: ['email']
 * });
 */
async function getCustomers(page = 1, limit = 10, filters = {}, search = null) {
  try {
    let baseQuery = `
      SELECT 
        ci.customer_id, 
        ci.customer_email, 
        ci.customer_phone_number, 
        ci.customer_hash, 
        ci.customer_added_date, 
        info.customer_first_name, 
        info.customer_last_name, 
        info.active_customer_status
      FROM customer_identifier ci
      INNER JOIN customer_info info 
        ON ci.customer_id = info.customer_id
    `;

    const conditions = [];
    const queryParams = [];

    // Apply filters
    if (filters.active !== undefined) {
      conditions.push("info.active_customer_status = ?");
      queryParams.push(filters.active);
    }

    // Apply search
    if (search && search.term && search.fields.length > 0) {
      const searchConditions = search.fields
        .map((field) => {
          switch (field) {
            case "name":
              return "(info.customer_first_name LIKE ? OR info.customer_last_name LIKE ?)";
            case "email":
              return "ci.customer_email LIKE ?";
            case "phone":
              return "ci.customer_phone_number LIKE ?";
            default:
              return null;
          }
        })
        .filter(Boolean);

      if (searchConditions.length > 0) {
        conditions.push(`(${searchConditions.join(" OR ")})`);

        // Add search parameters for each condition
        search.fields.forEach((field) => {
          const searchTerm = `%${search.term}%`;
          if (field === "name") {
            queryParams.push(searchTerm, searchTerm); // For both first and last name
          } else {
            queryParams.push(searchTerm);
          }
        });
      }
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY
    baseQuery += " ORDER BY ci.customer_id DESC";

    // Calculate pagination
    const offset = (page - 1) * limit;
    const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`;

    // Execute both queries
    const [customers, countResult] = await Promise.all([
      query(paginatedQuery, queryParams),
      query(countQuery, queryParams),
    ]);

    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}
const getCustomerById = async (customerId) => {
  try {
    const sql = `
        SELECT 
          ci.customer_id, 
          ci.customer_email, 
          ci.customer_phone_number, 
          ci.customer_hash, 
          ci.customer_added_date, 
          info.customer_first_name, 
          info.customer_last_name, 
          info.active_customer_status
        FROM customer_identifier ci
        INNER JOIN customer_info info 
          ON ci.customer_id = info.customer_id
        WHERE ci.customer_id = ?;
      `;

    // Execute the query with the customerId as a parameter
    const rows = await query(sql, [customerId]);

    if (rows.length === 0) {
      throw new Error("Customer not found");
    }

    return rows[0]; // Return the first customer, since the ID should be unique
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw error;
  }
};

const updateCustomer = async (customerId, updatedData) => {
  try {
    // Initialize an array to hold the dynamic SET fields and values
    const setClauses = [];
    const values = [];

    // Check which fields are provided and add them to the query
    if (updatedData.customer_email) {
      setClauses.push("ci.customer_email = ?");
      values.push(updatedData.customer_email);
    }
    if (updatedData.customer_phone_number) {
      setClauses.push("ci.customer_phone_number = ?");
      values.push(updatedData.customer_phone_number);
    }
    if (updatedData.customer_hash) {
      setClauses.push("ci.customer_hash = ?");
      values.push(updatedData.customer_hash);
    }
    if (updatedData.customer_first_name) {
      setClauses.push("info.customer_first_name = ?");
      values.push(updatedData.customer_first_name);
    }
    if (updatedData.customer_last_name) {
      setClauses.push("info.customer_last_name = ?");
      values.push(updatedData.customer_last_name);
    }
    if (updatedData.active_customer_status !== undefined) {
      setClauses.push("info.active_customer_status = ?");
      values.push(updatedData.active_customer_status);
    }

    // If no fields were provided, throw an error
    if (setClauses.length === 0) {
      throw new Error("No data to update");
    }

    // Construct the final SQL
    const sql = `
        UPDATE customer_identifier ci
        INNER JOIN customer_info info 
          ON ci.customer_id = info.customer_id
        SET ${setClauses.join(", ")}
        WHERE ci.customer_id = ?;
      `;

    // Add customerId to the values array
    values.push(customerId);

    // Execute the query
    const result = await query(sql, values);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      throw new Error("Customer not found or no changes made");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

// Export all service functions using ES6 named export syntax
// Named exports are ideal for service modules that provide multiple related functions
// This allows consumers to import specific functions: import { addCustomer, getCustomers } from './customer.service.js'
// or import all functions: import * as customerService from './customer.service.js'
export {
  addCustomer,
  getCustomerByEmail,
  getCustomers,
  getCustomerById,
  updateCustomer,
};
