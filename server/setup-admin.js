const conn = require("./config/db.config");
const bcrypt = require("bcrypt");

async function setupAdmin() {
  try {
    console.log("Setting up admin account...");

    // First, ensure roles exist
    await conn.query(`
      INSERT OR IGNORE INTO company_roles (company_role_name)
      VALUES ('Employee'), ('Manager'), ('Admin')
    `);
    console.log("✓ Roles created/verified");

    // Check if admin already exists
    const existingAdmin = await conn.query(
      "SELECT employee_id FROM employee WHERE employee_email = ?",
      [process.env.AdminEmail || "admin@abegarage.com"]
    );

    if (existingAdmin.length > 0) {
      console.log("✓ Admin account already exists");
      return;
    }

    // Create admin employee
    await conn.query(
      `
      INSERT INTO employee (employee_email, active_employee, added_date)
      VALUES (?, 1, CURRENT_TIMESTAMP)
    `,
      [process.env.AdminEmail || "admin@abegarage.com"]
    );
    console.log("✓ Admin employee created");

    // Get the employee ID
    const employeeResult = await conn.query(
      "SELECT employee_id FROM employee WHERE employee_email = ?",
      [process.env.AdminEmail || "admin@abegarage.com"]
    );
    const employeeId = employeeResult[0].employee_id;

    // Create employee info
    await conn.query(
      `
      INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone)
      VALUES (?, ?, ?, ?)
    `,
      [employeeId, "Admin", "Admin", "555-555-5555"]
    );
    console.log("✓ Admin info created");

    // Hash password
    const password = process.env.AdminPassword || "AbeGarage2025!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee password
    await conn.query(
      `
      INSERT INTO employee_pass (employee_id, employee_password_hashed)
      VALUES (?, ?)
    `,
      [employeeId, hashedPassword]
    );
    console.log("✓ Admin password created");

    // Assign admin role
    await conn.query(
      `
      INSERT INTO employee_role (employee_id, company_role_id)
      VALUES (?, 3)
    `,
      [employeeId]
    );
    console.log("✓ Admin role assigned");

    console.log("\n🎉 Admin account setup complete!");
    console.log("Email:", process.env.AdminEmail || "admin@abegarage.com");
    console.log("Password:", process.env.AdminPassword || "AbeGarage2025!");
    console.log("\nYou can now log in to the application.");
  } catch (error) {
    console.error("Error setting up admin account:", error);
    // Don't throw the error, just log it
    console.log("Admin setup failed, but continuing...");
  }
}

// Only run directly if this file is executed, not when required as module
if (require.main === module) {
  setupAdmin().then(() => process.exit(0));
} else {
  // Export the function when used as module
  module.exports = setupAdmin;
}
