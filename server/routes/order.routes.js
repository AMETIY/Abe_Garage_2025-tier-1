// Import express using ES6 default import syntax
import express from "express";
const router = express.Router();

// Import order controller functions using named imports with .js extension
import {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

// Import middleware functions using named imports with .js extension
import { verifyToken } from "../middlewares/auth.middleware.js";

// Route to create a new order
router.post("/api/order", [verifyToken], addOrder);

// Route to get all orders
router.get("/api/orders", [verifyToken], getAllOrders);

// Route to get a specific order by ID
router.get("/api/order/:id", getOrderById);

// Route to update an order
router.patch("/api/order/:id", [verifyToken], updateOrder);

// Route to update order status
router.put("/api/order/:id/status", [verifyToken], updateOrderStatus);

// Route to delete an order
router.delete("/api/order/:id", [verifyToken], deleteOrder);

// Export the router using default export pattern
export default router;
