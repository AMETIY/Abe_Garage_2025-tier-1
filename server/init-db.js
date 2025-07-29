#!/usr/bin/env node

/**
 * Database Initialization Script for PostgreSQL
 * Run this to set up the database tables and initial data
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import pg from "pg";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

const { Pool } = pg;

// Create PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initializeDatabase() {
  console.log("🚀 Initializing PostgreSQL database...");

  try {
    // Test connection
    console.log("🔍 Testing database connection...");
    const client = await pool.connect();
    console.log("✅ Database connection successful");

    // Read SQL file
    console.log("📋 Reading initialization SQL...");
    const sqlPath = join(__dirname, "init-postgres.sql");
    const sql = readFileSync(sqlPath, "utf8");

    // Execute SQL
    console.log("🔧 Executing database initialization...");
    await client.query(sql);
    console.log("✅ Database initialized successfully");

    // Verify tables
    console.log("🔍 Verifying tables...");
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📋 Created tables:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    client.release();
    console.log("🎉 Database initialization completed!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
