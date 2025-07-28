// Import the express module using ES6 default import syntax
import express from "express";
// Call the router method from express to create the router
const router = express.Router();

// Import the install controller function using named import with .js extension
import { install } from "../controllers/install.controller.js";

// Create a route to handle the install request on get
router.get("/install", install);

// Export the router using default export pattern
export default router;
