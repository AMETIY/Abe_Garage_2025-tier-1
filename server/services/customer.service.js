import { query } from "../config/db.config.js";
// Import bcrypt for password hashing using ES6 default import syntax
import bcrypt from "bcrypt";

// Function to add a new customer
async function addCustomer(email, phoneNumber, firstName, lastName, status) {
  try {
    // Generate a hashed value for customer security
    const customerHash = await bcrypt.hash(email, 10);

    // Insert into `customer_identifier` and return the ID
    const customerResult = await query(
      `INSERT INTO customer_identifier (customer_email, customer_phone_number, customer_hash)
       VALUES ($1, $2, $3) RETURNING customer_id`,
      [email, phoneNumber, customerHash]
    );

    const customerId = customerResult[0].customer_id; // Get newly inserted customer_id from PostgreSQL

    // Insert into `customer_info`
    await query(
      `INSERT INTO customer_info (customer_id, customer_first_name, customer_last_name, active_customer_status)
       VALUES ($1, $2, $3, $4)`,
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
      "SELECT * FROM customer_identifier WHERE customer_email = $1",
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
      conditions.push(
        `info.active_customer_status = $${queryParams.length + 1}`
      );
      queryParams.push(filters.active);
    }

    // Apply search
    if (search && search.term && search.fields.length > 0) {
      const searchConditions = [];

      search.fields.forEach((field) => {
        const searchTerm = `%${search.term}%`;
        switch (field) {
          case "name":
            searchConditions.push(
              `info.customer_first_name ILIKE $${queryParams.length + 1}`
            );
            queryParams.push(searchTerm);
            searchConditions.push(
              `info.customer_last_name ILIKE $${queryParams.length + 1}`
            );
            queryParams.push(searchTerm);
            break;
          case "email":
            searchConditions.push(
              `ci.customer_email ILIKE $${queryParams.length + 1}`
            );
            queryParams.push(searchTerm);
            break;
          case "phone":
            searchConditions.push(
              `ci.customer_phone_number ILIKE $${queryParams.length + 1}`
            );
            queryParams.push(searchTerm);
            break;
        }
      });

      if (searchConditions.length > 0) {
        conditions.push(`(${searchConditions.join(" OR ")})`);
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
        WHERE ci.customer_id = $1;
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
    let paramIndex = 1;

    // Check which fields are provided and add them to the query
    if (updatedData.customer_email) {
      setClauses.push(`ci.customer_email = $${paramIndex++}`);
      values.push(updatedData.customer_email);
    }
    if (updatedData.customer_phone_number) {
      setClauses.push(`ci.customer_phone_number = $${paramIndex++}`);
      values.push(updatedData.customer_phone_number);
    }
    if (updatedData.customer_hash) {
      setClauses.push(`ci.customer_hash = $${paramIndex++}`);
      values.push(updatedData.customer_hash);
    }
    if (updatedData.customer_first_name) {
      setClauses.push(`info.customer_first_name = $${paramIndex++}`);
      values.push(updatedData.customer_first_name);
    }
    if (updatedData.customer_last_name) {
      setClauses.push(`info.customer_last_name = $${paramIndex++}`);
      values.push(updatedData.customer_last_name);
    }
    if (updatedData.active_customer_status !== undefined) {
      setClauses.push(`info.active_customer_status = $${paramIndex++}`);
      values.push(updatedData.active_customer_status);
    }

    // If no fields were provided, throw an error
    if (setClauses.length === 0) {
      throw new Error("No data to update");
    }

    // PostgreSQL doesn't support INNER JOIN in UPDATE the same way as MySQL
    // We need to use a different approach
    const sql = `
        UPDATE customer_identifier ci
        SET ${setClauses.filter((clause) => clause.includes("ci.")).join(", ")}
        WHERE ci.customer_id = $${paramIndex};
      `;

    // Add customerId to the values array
    values.push(customerId);

    // Execute the customer_identifier update if there are any ci fields
    const ciClauses = setClauses.filter((clause) => clause.includes("ci."));
    if (ciClauses.length > 0) {
      const ciSql = `
        UPDATE customer_identifier
        SET ${ciClauses.map((clause) => clause.replace("ci.", "")).join(", ")}
        WHERE customer_id = $${values.length};
      `;
      await query(
        ciSql,
        values.slice(0, ciClauses.length).concat([customerId])
      );
    }

    // Execute the customer_info update if there are any info fields
    const infoClauses = setClauses.filter((clause) => clause.includes("info."));
    if (infoClauses.length > 0) {
      const infoValues = [];
      let infoParamIndex = 1;
      const infoSetClauses = [];

      if (updatedData.customer_first_name) {
        infoSetClauses.push(`customer_first_name = $${infoParamIndex++}`);
        infoValues.push(updatedData.customer_first_name);
      }
      if (updatedData.customer_last_name) {
        infoSetClauses.push(`customer_last_name = $${infoParamIndex++}`);
        infoValues.push(updatedData.customer_last_name);
      }
      if (updatedData.active_customer_status !== undefined) {
        infoSetClauses.push(`active_customer_status = $${infoParamIndex++}`);
        infoValues.push(updatedData.active_customer_status);
      }

      const infoSql = `
        UPDATE customer_info
        SET ${infoSetClauses.join(", ")}
        WHERE customer_id = $${infoParamIndex};
      `;
      infoValues.push(customerId);
      await query(infoSql, infoValues);
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
