// Database initialization script for setting up schema in both MySQL and PostgreSQL
import { dbMigration } from "./database.migration.js";
import { getDatabaseConfig } from "./database.config.js";

// Define the database schema
const schema = {
  // Employees table
  employees: [
    { name: "employee_id", type: "id" },
    {
      name: "employee_first_name",
      type: "varchar",
      length: 255,
      notNull: true,
    },
    { name: "employee_last_name", type: "varchar", length: 255, notNull: true },
    { name: "employee_phone", type: "varchar", length: 20, notNull: true },
    { name: "employee_email", type: "varchar", length: 255, notNull: true },
    { name: "active_employee", type: "boolean", default: 1 },
    { name: "added_date", type: "datetime", default: "CURRENT_TIMESTAMP" },
    { name: "employee_password_hashed", type: "varchar", length: 255 },
    { name: "employee_role", type: "int", default: 2 },
  ],

  // Customers table
  customers: [
    { name: "customer_id", type: "id" },
    { name: "customer_email", type: "varchar", length: 255, notNull: true },
    {
      name: "customer_phone_number",
      type: "varchar",
      length: 20,
      notNull: true,
    },
    {
      name: "customer_first_name",
      type: "varchar",
      length: 255,
      notNull: true,
    },
    { name: "customer_last_name", type: "varchar", length: 255, notNull: true },
    { name: "active_customer_status", type: "boolean", default: 1 },
    {
      name: "customer_added_date",
      type: "datetime",
      default: "CURRENT_TIMESTAMP",
    },
    { name: "customer_hash", type: "varchar", length: 255 },
  ],

  // Services table
  services: [
    { name: "service_id", type: "id" },
    { name: "service_name", type: "varchar", length: 255, notNull: true },
    { name: "service_description", type: "text" },
    {
      name: "service_price",
      type: "decimal",
      precision: 10,
      scale: 2,
      notNull: true,
    },
  ],

  // Vehicles table
  vehicles: [
    { name: "vehicle_id", type: "id" },
    { name: "vehicle_year", type: "int", notNull: true },
    { name: "vehicle_make", type: "varchar", length: 255, notNull: true },
    { name: "vehicle_model", type: "varchar", length: 255, notNull: true },
    { name: "vehicle_type", type: "varchar", length: 255, notNull: true },
    { name: "vehicle_mileage", type: "int" },
    { name: "vehicle_tag", type: "varchar", length: 255 },
    { name: "vehicle_serial", type: "varchar", length: 255, notNull: true },
    { name: "vehicle_color", type: "varchar", length: 255, notNull: true },
    { name: "customer_id", type: "int", notNull: true },
  ],

  // Orders table
  orders: [
    { name: "order_id", type: "id" },
    { name: "employee_id", type: "int", notNull: true },
    { name: "customer_id", type: "int", notNull: true },
    { name: "vehicle_id", type: "int", notNull: true },
    { name: "order_date", type: "datetime", default: "CURRENT_TIMESTAMP" },
    { name: "order_description", type: "text" },
    { name: "order_completed", type: "boolean", default: 0 },
    {
      name: "order_total_price",
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0,
    },
  ],

  // Order services junction table
  order_services: [
    { name: "order_service_id", type: "id" },
    { name: "order_id", type: "int", notNull: true },
    { name: "service_id", type: "int", notNull: true },
    { name: "service_completed", type: "boolean", default: 0 },
  ],

  // Employee roles table
  employee_role: [
    { name: "employee_role_id", type: "id" },
    { name: "employee_role_name", type: "varchar", length: 255, notNull: true },
  ],
};

// Initialize database tables
export async function initializeDatabase() {
  const config = getDatabaseConfig();
  console.log(
    `🚀 Initializing database schema for ${config.type.toUpperCase()}...`
  );

  try {
    // Create tables
    for (const [tableName, columns] of Object.entries(schema)) {
      const exists = await dbMigration.tableExists(tableName);

      if (!exists) {
        console.log(`📋 Creating table: ${tableName}`);
        const createSQL = dbMigration.generateCreateTableSQL(
          tableName,
          columns
        );
        await dbMigration.executeQuery(createSQL);
        console.log(`✅ Table ${tableName} created successfully`);
      } else {
        console.log(`ℹ️  Table ${tableName} already exists`);
      }
    }

    // Insert default data if needed
    await insertDefaultData();

    console.log("🎉 Database initialization completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

// Insert default data
async function insertDefaultData() {
  try {
    // Check if employee roles exist
    const roleExists = await dbMigration.executeQuery(
      "SELECT COUNT(*) as count FROM employee_role"
    );

    if (roleExists[0].count === 0) {
      console.log("📝 Inserting default employee roles...");

      // Insert default roles
      await dbMigration.executeQuery(
        "INSERT INTO employee_role (employee_role_name) VALUES (?), (?), (?)",
        ["Admin", "Manager", "Employee"]
      );

      console.log("✅ Default employee roles inserted");
    }

    // Check if admin user exists
    const adminExists = await dbMigration.executeQuery(
      "SELECT COUNT(*) as count FROM employees WHERE employee_role = 1"
    );

    if (adminExists[0].count === 0) {
      console.log(
        "👤 No admin user found. Please create one using the admin setup script."
      );
    }
  } catch (error) {
    console.error("⚠️  Error inserting default data:", error);
  }
}

// Verify database schema
export async function verifyDatabaseSchema() {
  console.log("🔍 Verifying database schema...");

  try {
    for (const tableName of Object.keys(schema)) {
      const exists = await dbMigration.tableExists(tableName);
      if (!exists) {
        console.error(`❌ Missing table: ${tableName}`);
        return false;
      }
    }

    console.log("✅ Database schema verification completed");
    return true;
  } catch (error) {
    console.error("❌ Schema verification failed:", error);
    return false;
  }
}

// Export schema for external use
export { schema };
