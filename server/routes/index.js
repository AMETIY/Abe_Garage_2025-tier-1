// Import the express module using ES6 default import syntax
import express from "express";
// Call the router method from express to create the router
const router = express.Router();
// Import the install router using default import with .js extension
import installRouter from "./install.routes.js";
// Import the employee routes using default import with .js extension
import employeeRouter from "./employee.routes.js";
// Import the login routes using default import with .js extension
import loginRoutes from "./login.routes.js";
// Import the auth routes using default import with .js extension
import authRoutes from "./auth.routes.js";
// Import the service routes using default import with .js extension
import serviceRoute from "./service.routes.js";
// Import the customer routes using default import with .js extension
import customerRoute from "./customer.routes.js";
// Import the vehicle routes using default import with .js extension
import vehicleRoute from "./vehicle.routes.js";
// Import the order routes using default import with .js extension
import orderRoute from "./order.routes.js";
// Import the performance routes using default import with .js extension
import performanceRoute from "./performance.routes.js";
// Import the database performance routes using default import with .js extension
import databasePerformanceRoutes from "./database-performance.routes.js";
// Import the setup routes using default import with .js extension
import setupRoutes from "./setup.routes.js";
// Add the install router to the main router
router.use(installRouter);
// Add the employee routes to the main router
router.use(employeeRouter);
// Add the login routes to the main router
router.use(loginRoutes);
// Adding the auth routes to the main router
router.use(authRoutes);
// Adding the service routes to the main router
router.use(serviceRoute);
// Adding the customer routes to the main router
router.use(customerRoute);
// Adding the vehicle routes to the main router
router.use(vehicleRoute);
// Adding the order routes to the main router
router.use(orderRoute);
// Adding the performance routes to the main router
router.use(performanceRoute);
// Adding the database performance routes to the main router
router.use("/api/database", databasePerformanceRoutes);
// Adding the setup routes to the main router
router.use(setupRoutes);

// Root route for API documentation
router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Abe Garage API Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      employees: "/api/employees",
      customers: "/api/customers",
      services: "/api/services",
      vehicles: "/api/vehicles",
      orders: "/api/orders",
      login: "/api/employee/login",
      setup: {
        initDatabase: "/api/setup/init-database",
        checkDatabase: "/api/setup/check-database",
      },
    },
    documentation: "Welcome to Abe Garage Management System API",
  });
});

// Health check endpoint
router.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Export the router using default export
export default router;
