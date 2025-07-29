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

    // Read the PostgreSQL initialization file
    const sqlPath = join(__dirname, "../init-postgres.sql");
    const sql = readFileSync(sqlPath, "utf8");

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

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
