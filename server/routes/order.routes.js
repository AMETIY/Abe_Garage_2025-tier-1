const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const  searchOrder  = require("../controllers/order.controller");

// import the authMiddleware
const { verifyToken,isAdmin, } = require("../middlewares/auth.middleware");

// Route to create a new order
router.post("/order",[verifyToken], orderController.createOrder);

// Route to get all orders
router.get("/orders", orderController.getAllOrders);

// Route to get an order by ID
router.get("/order/:id", orderController.getOrderById);

// Route to get detailed order information by order ID
router.get("/order_detail/:id", orderController.getOrderDetailById);

// Route to get detailed order information by order hash
router.get("/order/details/:order_hash", orderController.getOrderAllDetail);


// Route to update an order
router.put("/order/:order_id", orderController.updateOrder);
// 
router.get("/search-customers", orderController.searchOrder);

//Route to get order by CUSTOMER ID
router.get('/corder/customer/:customerid',orderController.getOrderByCustomerId)

module.exports = router;
