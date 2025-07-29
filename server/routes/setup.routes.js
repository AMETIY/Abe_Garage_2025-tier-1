// Import the express module using ES6 default import syntax
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { dbAdapter } from "../config/database.config.js";

// Call the router method from express to create the router
const router = express.Router();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database initialization endpoint
router.get("/api/setup/init-database", async (req, res) => {
  try {
    console.log("🚀 Starting database initialization...");

    // Define the SQL statements in proper order
    const statements = [
      // Create base tables first (no foreign keys)
      `CREATE TABLE IF NOT EXISTS customer_identifier (
        customer_id SERIAL PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL UNIQUE,
        customer_phone_number VARCHAR(255) NOT NULL,
        customer_added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        customer_hash VARCHAR(255) NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS company_roles (
        company_role_id SERIAL PRIMARY KEY,
        company_role_name VARCHAR(255) NOT NULL UNIQUE
      )`,

      `CREATE TABLE IF NOT EXISTS common_services (
        service_id SERIAL PRIMARY KEY,
        service_name VARCHAR(255) NOT NULL,
        service_description TEXT
      )`,

      // Create tables with foreign keys
      `CREATE TABLE IF NOT EXISTS customer_info (
        customer_info_id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        customer_first_name VARCHAR(255) NOT NULL,
        customer_last_name VARCHAR(255) NOT NULL,
        active_customer_status INTEGER NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id)
      )`,

      `CREATE TABLE IF NOT EXISTS customer_vehicle_info (
        vehicle_id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        vehicle_year INTEGER NOT NULL,
        vehicle_make VARCHAR(255) NOT NULL,
        vehicle_model VARCHAR(255) NOT NULL,
        vehicle_type VARCHAR(255) NOT NULL,
        vehicle_mileage INTEGER NOT NULL,
        vehicle_tag VARCHAR(255) NOT NULL,
        vehicle_serial VARCHAR(255) NOT NULL,
        vehicle_color VARCHAR(255) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id)
      )`,

      `CREATE TABLE IF NOT EXISTS company_employees (
        employee_id SERIAL PRIMARY KEY,
        employee_email VARCHAR(255) NOT NULL UNIQUE,
        employee_first_name VARCHAR(255) NOT NULL,
        employee_last_name VARCHAR(255) NOT NULL,
        employee_phone VARCHAR(255) NOT NULL,
        employee_password_hashed VARCHAR(255) NOT NULL,
        employee_added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        company_role_id INTEGER NOT NULL,
        active_employee INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (company_role_id) REFERENCES company_roles (company_role_id)
      )`,

      `CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        order_description TEXT,
        order_completed INTEGER DEFAULT 0,
        order_services TEXT,
        order_total_price DECIMAL(10,2) DEFAULT 0.00,
        additional_request TEXT,
        notes_for_internal_use TEXT,
        additional_requests_completed INTEGER DEFAULT 0,
        order_status INTEGER DEFAULT 1,
        order_hash VARCHAR(255) NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES company_employees (employee_id),
        FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id),
        FOREIGN KEY (vehicle_id) REFERENCES customer_vehicle_info (vehicle_id)
      )`,

      // Insert default data
      `INSERT INTO company_roles (company_role_name) VALUES 
        ('Employee'), ('Manager'), ('Admin') 
        ON CONFLICT (company_role_name) DO NOTHING`,

      `INSERT INTO company_employees (
        employee_email, employee_first_name, employee_last_name, 
        employee_phone, employee_password_hashed, company_role_id, active_employee
      ) VALUES (
        'admin@admin.com', 'Admin', 'User', '123-456-7890',
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/jFZntZzdTnkHBmkH.fMM0rJ41mSi',
        3, 1
      ) ON CONFLICT (employee_email) DO NOTHING`,

      `INSERT INTO common_services (service_name, service_description) VALUES 
        ('Oil Change', 'Complete oil and filter change service'),
        ('Brake Service', 'Brake inspection and repair service'),
        ('Tire Service', 'Tire installation and balancing'),
        ('Engine Diagnostic', 'Computer diagnostic of engine systems'),
        ('Transmission Service', 'Transmission fluid change and inspection')
        ON CONFLICT DO NOTHING`,
    ];

    console.log(`🔧 Executing ${statements.length} SQL statements...`);

    const results = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await dbAdapter.query(statement);
        results.push(`✅ Statement ${i + 1}: Success`);
        console.log(
          `✅ Statement ${i + 1}/${statements.length} executed successfully`
        );
      } catch (error) {
        // Some statements might fail if tables already exist - that's okay
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate key") ||
          error.code === "42P07"
        ) {
          results.push(`⚠️ Statement ${i + 1}: Already exists (skipped)`);
          console.log(
            `⚠️ Statement ${i + 1}/${
              statements.length
            } skipped (already exists)`
          );
        } else {
          results.push(`❌ Statement ${i + 1}: ${error.message}`);
          console.error(
            `❌ Statement ${i + 1}/${statements.length} failed:`,
            error.message
          );
        }
      }
    }

    // Verify essential tables exist
    console.log("🔍 Verifying essential tables...");
    const tableCheck = await dbAdapter.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tableCheck.map((row) => row.table_name);
    console.log("📋 Available tables:", tables);

    res.json({
      status: "success",
      message: "Database initialization completed",
      timestamp: new Date().toISOString(),
      results: results,
      tables: tables,
      totalStatements: statements.length,
    });
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database initialization failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Check admin user endpoint
router.get("/api/setup/check-admin", async (req, res) => {
  try {
    // Check if admin user exists and get details
    const adminCheck = await dbAdapter.query(
      "SELECT employee_email, employee_first_name, employee_last_name, employee_password_hashed, company_role_id FROM company_employees WHERE employee_email = $1",
      ["admin@admin.com"]
    );

    if (adminCheck.length === 0) {
      return res.json({
        status: "error",
        message: "Admin user not found",
        timestamp: new Date().toISOString(),
      });
    }

    const admin = adminCheck[0];

    res.json({
      status: "success",
      message: "Admin user found",
      timestamp: new Date().toISOString(),
      admin: {
        email: admin.employee_email,
        name: `${admin.employee_first_name} ${admin.employee_last_name}`,
        role_id: admin.company_role_id,
        password_hash_preview:
          admin.employee_password_hashed.substring(0, 20) + "...",
      },
    });
  } catch (error) {
    console.error("❌ Admin check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Admin check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test password verification endpoint
router.post("/api/setup/test-password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Get admin user
    const adminCheck = await dbAdapter.query(
      "SELECT employee_password_hashed FROM company_employees WHERE employee_email = $1",
      ["admin@admin.com"]
    );

    if (adminCheck.length === 0) {
      return res.json({
        status: "error",
        message: "Admin user not found",
        timestamp: new Date().toISOString(),
      });
    }

    const admin = adminCheck[0];

    // Import bcrypt for password verification
    const bcrypt = await import("bcrypt");
    const isValid = await bcrypt.compare(
      password,
      admin.employee_password_hashed
    );

    res.json({
      status: "success",
      message: "Password verification completed",
      timestamp: new Date().toISOString(),
      passwordMatch: isValid,
      testedPassword: password,
      hashPreview: admin.employee_password_hashed.substring(0, 20) + "...",
    });
  } catch (error) {
    console.error("❌ Password test failed:", error);
    res.status(500).json({
      status: "error",
      message: "Password test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Generate password hash endpoint
router.post("/api/setup/generate-hash", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Import bcrypt for password hashing
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash(password, 10);

    res.json({
      status: "success",
      message: "Password hash generated",
      timestamp: new Date().toISOString(),
      password: password,
      hash: hash,
    });
  } catch (error) {
    console.error("❌ Hash generation failed:", error);
    res.status(500).json({
      status: "error",
      message: "Hash generation failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Fix admin password endpoint
router.post("/api/setup/fix-admin-password", async (req, res) => {
  try {
    const correctHash =
      "$2b$10$2BBiopvgyd/1LBXQVukdheRk9hs3e/ggHfE/fsReWH4wbd9FfXxZG";

    // Update admin password with correct hash
    const updateResult = await dbAdapter.query(
      "UPDATE company_employees SET employee_password_hashed = $1 WHERE employee_email = $2",
      [correctHash, "admin@admin.com"]
    );

    console.log("✅ Admin password updated successfully");

    // Verify the update worked
    const verifyResult = await dbAdapter.query(
      "SELECT employee_email, employee_password_hashed FROM company_employees WHERE employee_email = $1",
      ["admin@admin.com"]
    );

    if (verifyResult.length === 0) {
      throw new Error("Admin user not found after update");
    }

    // Test the new hash
    const bcrypt = await import("bcrypt");
    const isValid = await bcrypt.compare(
      "123456",
      verifyResult[0].employee_password_hashed
    );

    res.json({
      status: "success",
      message: "Admin password fixed successfully",
      timestamp: new Date().toISOString(),
      passwordNowWorks: isValid,
      newHashPreview: correctHash.substring(0, 20) + "...",
      instructions: "You can now login with admin@admin.com / 123456",
    });
  } catch (error) {
    console.error("❌ Admin password fix failed:", error);
    res.status(500).json({
      status: "error",
      message: "Admin password fix failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test JWT and security functions
router.get("/api/setup/test-jwt", async (req, res) => {
  try {
    // Import security functions
    const {
      generateAccessToken,
      generateRefreshToken,
      createAuditLog,
      AUDIT_LEVELS,
    } = await import("../utils/security.js");

    // Test payload
    const testPayload = {
      employee_id: 1,
      employee_email: "test@test.com",
      employee_role: 3,
      employee_first_name: "Test",
    };

    // Test JWT generation
    const accessToken = generateAccessToken(testPayload);
    const refreshToken = generateRefreshToken();

    // Test audit log
    const auditLog = createAuditLog(
      "TEST_LOGIN",
      1,
      { email: "test@test.com" },
      AUDIT_LEVELS.MEDIUM
    );

    res.json({
      status: "success",
      message: "JWT and security functions test completed",
      timestamp: new Date().toISOString(),
      results: {
        accessTokenGenerated: !!accessToken,
        refreshTokenGenerated: !!refreshToken,
        auditLogCreated: !!auditLog,
        jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT_SET",
        accessTokenPreview: accessToken
          ? accessToken.substring(0, 50) + "..."
          : null,
      },
    });
  } catch (error) {
    console.error("❌ JWT test failed:", error);
    res.status(500).json({
      status: "error",
      message: "JWT test failed",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
});

// Database status check endpoint
router.get("/api/setup/check-database", async (req, res) => {
  try {
    // Check if essential tables exist
    const tableCheck = await dbAdapter.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tableCheck.map((row) => row.table_name);
    const essentialTables = [
      "company_employees",
      "company_roles",
      "customer_identifier",
      "customer_info",
      "customer_vehicle_info",
      "common_services",
      "orders",
    ];

    const missingTables = essentialTables.filter(
      (table) => !tables.includes(table)
    );
    const isInitialized = missingTables.length === 0;

    // Check if admin user exists
    let adminExists = false;
    if (tables.includes("company_employees")) {
      try {
        const adminCheck = await dbAdapter.query(
          "SELECT COUNT(*) as count FROM company_employees WHERE employee_email = $1",
          ["admin@admin.com"]
        );
        adminExists = adminCheck[0].count > 0;
      } catch (error) {
        console.error("Error checking admin user:", error);
      }
    }

    res.json({
      status: "success",
      message: "Database status check completed",
      timestamp: new Date().toISOString(),
      isInitialized: isInitialized,
      tables: tables,
      missingTables: missingTables,
      adminExists: adminExists,
      totalTables: tables.length,
    });
  } catch (error) {
    console.error("❌ Database status check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database status check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// View customers endpoint - for debugging
router.get("/api/setup/view-customers", async (req, res) => {
  try {
    // Get all customers with their info
    const customers = await dbAdapter.query(`
      SELECT 
        ci.customer_id,
        ci.customer_email,
        ci.customer_phone_number,
        ci.customer_added_date,
        ci.customer_hash,
        info.customer_first_name,
        info.customer_last_name,
        info.active_customer_status
      FROM customer_identifier ci
      LEFT JOIN customer_info info ON ci.customer_id = info.customer_id
      ORDER BY ci.customer_added_date DESC
    `);

    // Get customer count
    const countResult = await dbAdapter.query(
      "SELECT COUNT(*) as total FROM customer_identifier"
    );
    const totalCustomers = countResult[0].total;

    res.json({
      status: "success",
      message: "Customer data retrieved successfully",
      timestamp: new Date().toISOString(),
      totalCustomers: parseInt(totalCustomers),
      customers: customers,
    });
  } catch (error) {
    console.error("❌ View customers failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve customer data",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// View all tables data endpoint - for debugging
router.get("/api/setup/view-all-data", async (req, res) => {
  try {
    const data = {};

    // Get customers
    data.customers = await dbAdapter.query(`
      SELECT 
        ci.customer_id,
        ci.customer_email,
        ci.customer_phone_number,
        ci.customer_added_date,
        info.customer_first_name,
        info.customer_last_name,
        info.active_customer_status
      FROM customer_identifier ci
      LEFT JOIN customer_info info ON ci.customer_id = info.customer_id
      ORDER BY ci.customer_added_date DESC
      LIMIT 10
    `);

    // Get employees
    data.employees = await dbAdapter.query(`
      SELECT 
        employee_id,
        employee_email,
        employee_first_name,
        employee_last_name,
        employee_phone,
        company_role_id,
        active_employee,
        employee_added_date
      FROM company_employees
      ORDER BY employee_added_date DESC
      LIMIT 10
    `);

    // Get orders
    data.orders = await dbAdapter.query(`
      SELECT 
        order_id,
        employee_id,
        customer_id,
        vehicle_id,
        order_date,
        order_status,
        order_total_price
      FROM orders
      ORDER BY order_date DESC
      LIMIT 10
    `);

    // Get services
    data.services = await dbAdapter.query(`
      SELECT * FROM common_services ORDER BY service_id
    `);

    // Get roles
    data.roles = await dbAdapter.query(`
      SELECT * FROM company_roles ORDER BY company_role_id
    `);

    // Get counts
    const counts = {};
    counts.customers = (
      await dbAdapter.query("SELECT COUNT(*) as count FROM customer_identifier")
    )[0].count;
    counts.employees = (
      await dbAdapter.query("SELECT COUNT(*) as count FROM company_employees")
    )[0].count;
    counts.orders = (
      await dbAdapter.query("SELECT COUNT(*) as count FROM orders")
    )[0].count;
    counts.services = (
      await dbAdapter.query("SELECT COUNT(*) as count FROM common_services")
    )[0].count;

    res.json({
      status: "success",
      message: "All data retrieved successfully",
      timestamp: new Date().toISOString(),
      counts: counts,
      data: data,
    });
  } catch (error) {
    console.error("❌ View all data failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve data",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Clear customers endpoint - for testing (use with caution!)
router.delete("/api/setup/clear-customers", async (req, res) => {
  try {
    // Delete in proper order due to foreign key constraints
    await dbAdapter.query(
      "DELETE FROM orders WHERE customer_id IN (SELECT customer_id FROM customer_identifier)"
    );
    await dbAdapter.query("DELETE FROM customer_vehicle_info");
    await dbAdapter.query("DELETE FROM customer_info");
    await dbAdapter.query("DELETE FROM customer_identifier");

    res.json({
      status: "success",
      message: "All customer data cleared successfully",
      timestamp: new Date().toISOString(),
      warning: "This action cannot be undone!",
    });
  } catch (error) {
    console.error("❌ Clear customers failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to clear customer data",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Export the router using default export
export default router;
