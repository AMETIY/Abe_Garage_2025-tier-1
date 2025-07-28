#!/usr/bin/env node

/**
 * Deployment Setup Script for Render.com
 *
 * This script handles database initialization and setup for production deployment.
 * It's designed to run during the deployment process on Render.com.
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { dbAdapter, getDatabaseConfig } from "../config/database.config.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

/**
 * Initialize database schema for production deployment
 */
async function initializeDatabase() {
  console.log(
    "🚀 Starting database initialization for production deployment..."
  );

  try {
    const config = getDatabaseConfig();
    console.log(`📊 Using ${config.type.toUpperCase()} database configuration`);

    // Test database connection
    console.log("🔍 Testing database connection...");
    const isConnected = await dbAdapter.testConnection();

    if (!isConnected) {
      throw new Error("Failed to establish database connection");
    }

    console.log("✅ Database connection successful");

    // Read and execute initial schema
    console.log("📋 Reading database schema...");
    const schemaPath = join(__dirname, "../services/sql/initial-queries.sql");
    const schema = readFileSync(schemaPath, "utf8");

    // Split schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`🔧 Executing ${statements.length} schema statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await dbAdapter.query(statement);
        console.log(
          `✅ Statement ${i + 1}/${statements.length} executed successfully`
        );
      } catch (error) {
        // Some statements might fail if tables already exist - that's okay
        if (
          error.message.includes("already exists") ||
          error.code === "ER_TABLE_EXISTS_ERROR"
        ) {
          console.log(
            `⚠️  Statement ${i + 1}/${
              statements.length
            } skipped (already exists)`
          );
        } else {
          console.error(
            `❌ Statement ${i + 1}/${statements.length} failed:`,
            error.message
          );
          // Don't throw here - continue with other statements
        }
      }
    }

    // Verify essential tables exist
    console.log("🔍 Verifying essential tables...");
    const essentialTables = [
      "company_employees",
      "customers",
      "services",
      "vehicles",
      "orders",
    ];

    for (const table of essentialTables) {
      try {
        const result = await dbAdapter.query(
          `SELECT COUNT(*) as count FROM ${table} LIMIT 1`
        );
        console.log(
          `✅ Table '${table}' verified (${result[0].count} records)`
        );
      } catch (error) {
        console.error(
          `❌ Table '${table}' verification failed:`,
          error.message
        );
        throw new Error(
          `Essential table '${table}' is missing or inaccessible`
        );
      }
    }

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

/**
 * Verify deployment environment
 */
async function verifyEnvironment() {
  console.log("🔍 Verifying deployment environment...");

  const requiredEnvVars = [
    "NODE_ENV",
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASS",
    "JWT_SECRET",
    "FRONTEND_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars);
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }

  console.log("✅ All required environment variables are present");

  // Log configuration (without sensitive data)
  console.log("📋 Deployment configuration:");
  console.log(`  - Environment: ${process.env.NODE_ENV}`);
  console.log(`  - Port: ${process.env.PORT}`);
  console.log(`  - Database Type: ${process.env.DB_TYPE || "postgresql"}`);
  console.log(`  - Database Host: ${process.env.DB_HOST}`);
  console.log(`  - Database Name: ${process.env.DB_NAME}`);
  console.log(`  - Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`  - Pool Size: ${process.env.DB_POOL_SIZE || "10"}`);
}

/**
 * Main deployment setup function
 */
async function deploySetup() {
  try {
    console.log("🚀 Starting Render.com deployment setup...");
    console.log("=".repeat(50));

    await verifyEnvironment();
    await initializeDatabase();

    console.log("=".repeat(50));
    console.log("🎉 Deployment setup completed successfully!");
    console.log("🚀 Application is ready to start!");
  } catch (error) {
    console.error("❌ Deployment setup failed:", error.message);
    process.exit(1);
  } finally {
    // Clean up database connection
    try {
      await dbAdapter.close();
    } catch (error) {
      console.error("⚠️  Error closing database connection:", error.message);
    }
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case "init":
    deploySetup();
    break;
  case "verify":
    verifyEnvironment()
      .then(() => {
        console.log("✅ Environment verification completed");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Environment verification failed:", error.message);
        process.exit(1);
      });
    break;
  case "db-only":
    initializeDatabase()
      .then(() => {
        console.log("✅ Database initialization completed");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Database initialization failed:", error.message);
        process.exit(1);
      });
    break;
  default:
    console.log("Usage: node deploy-setup.js [init|verify|db-only]");
    console.log("  init     - Full deployment setup (verify + database)");
    console.log("  verify   - Verify environment variables only");
    console.log("  db-only  - Initialize database only");
    process.exit(1);
}
