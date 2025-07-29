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

// Export the router using default export
export default router;
