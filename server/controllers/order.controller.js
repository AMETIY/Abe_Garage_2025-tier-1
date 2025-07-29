import * as orderService from "../services/order.service.js";
import { sendOrderEmail } from "../utils/emailService.js";

const addOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Accept both 'order_services' (array of IDs) and 'services' (array of objects with service_id)
    let order_services = orderData.order_services;
    if (!order_services && Array.isArray(orderData.services)) {
      order_services = orderData.services.map((s) => s.service_id);
    }
    if (!order_services || order_services.length === 0) {
      return res.status(400).json({ error: "Order services are required" });
    }
    if (
      !orderData.employee_id ||
      !orderData.customer_id ||
      !orderData.vehicle_id
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Pass the mapped order_services to the service
    const { order_id, order_hash, customer_email } =
      await orderService.addOrder({ ...orderData, order_services });

    // Send email
    console.log(order_id, order_hash, customer_email);
    await sendOrderEmail(customer_email, order_hash);

    res.status(201).json({
      success: true,
      message: "Order created successfully. Email sent to customer.",
      order_id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderByHash(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided" });
    }

    const result = await orderService.updateOrder(id, updateData);
    res.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!String(order_status)) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided" });
    }

    const result = await orderService.updateOrderStatus(id, order_status);
    res.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
    const success = await orderService.deleteOrder(id);

    if (!success?.success) {
      return res.status(400).json({ error: "faild to delete the order" });
    }
    return res.status(200).json({ success: "true" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong!" });
  }
};
export {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
};
