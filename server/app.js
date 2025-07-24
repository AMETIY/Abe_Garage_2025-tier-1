// ` import express
const express = require("express");
// ` create web server
const app = express();
// ` import body-parser
const bodyParser = require("body-parser");

// ` import cors
const cors = require("cors");


// ` import dotenv
require("dotenv").config();

// Configure CORS for production - Allow all origins for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'https://localhost:5173',
        'http://127.0.0.1:5173',
        'http://192.168.1.72:5173'
      ]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.1.72:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Enable CORS middleware
app.use(cors(corsOptions));

// Enable JSON middleware with size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ` create a port from env file
const port = process.env.PORT || 8080 // Using a configurable port

// ` import routes
const routes = require("./routes/index");



// ` Add the routes to the application as middleware
app.use(routes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Abe Garage API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const conn = require('./config/db.config');
    const result = await conn.query("SELECT 1 as test");
    res.json({
      status: "success",
      message: "Database connection working",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Manual admin setup endpoint (for debugging)
app.post("/api/setup-admin", async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const conn = require('./config/db.config');
    
    console.log("Starting manual admin setup...");
    
    // First, check if roles exist and create them if not
    try {
      await conn.query(`
        INSERT OR IGNORE INTO company_roles (company_role_name)
        VALUES ('Employee'), ('Manager'), ('Admin')
      `);
      console.log("✓ Roles created/verified");
    } catch (roleError) {
      console.error("Role creation error:", roleError);
    }

    // Check if admin already exists
    const existingAdmin = await conn.query(
      "SELECT employee_id FROM employee WHERE employee_email = ?",
      ["admin@abegarage.com"]
    );

    if (existingAdmin.length > 0) {
      return res.json({
        status: "success",
        message: "Admin account already exists",
        admin_email: "admin@abegarage.com"
      });
    }

    // Create admin employee
    const employeeResult = await conn.query(
      `INSERT INTO employee (employee_email, active_employee, added_date)
       VALUES (?, 1, CURRENT_TIMESTAMP)`,
      ["admin@abegarage.com"]
    );
    
    const employeeId = employeeResult.insertId;
    console.log("✓ Admin employee created with ID:", employeeId);

    // Create employee info
    await conn.query(
      `INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone)
       VALUES (?, ?, ?, ?)`,
      [employeeId, "Admin", "Admin", "555-555-5555"]
    );
    console.log("✓ Admin info created");

    // Hash password and create employee password
    const password = "AbeGarage2025!";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await conn.query(
      `INSERT INTO employee_pass (employee_id, employee_password_hashed)
       VALUES (?, ?)`,
      [employeeId, hashedPassword]
    );
    console.log("✓ Admin password created");

    // Assign admin role (role ID 3 = Admin)
    await conn.query(
      `INSERT INTO employee_role (employee_id, company_role_id)
       VALUES (?, 3)`,
      [employeeId]
    );
    console.log("✓ Admin role assigned");

    res.json({
      status: "success",
      message: "Admin account setup completed successfully",
      admin_email: "admin@abegarage.com",
      admin_password: "AbeGarage2025!",
      employee_id: employeeId
    });
  } catch (error) {
    console.error("Manual admin setup failed:", error);
    res.status(500).json({
      status: "error",
      message: "Admin setup failed",
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all employees endpoint (for debugging)
app.get("/api/employees/debug", async (req, res) => {
  try {
    const conn = require('./config/db.config');
    const employees = await conn.query(`
      SELECT e.employee_id, e.employee_email, e.active_employee,
             ei.employee_first_name, ei.employee_last_name, ei.employee_phone,
             er.company_role_id, cr.company_role_name
      FROM employee e
      LEFT JOIN employee_info ei ON e.employee_id = ei.employee_id
      LEFT JOIN employee_role er ON e.employee_id = er.employee_id
      LEFT JOIN company_roles cr ON er.company_role_id = cr.company_role_id
    `);
    
    res.json({
      status: "success",
      message: "All employees retrieved",
      employees: employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to get employees",
      error: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// ` create app listener
app.listen(port, () => {
  console.log(`🚀 Abe Garage API Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
});

// ` export app

module.exports = app;
