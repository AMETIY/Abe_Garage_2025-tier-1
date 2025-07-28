// Import database query function using ES6 named import syntax
import { query } from "../config/db.config.js";

const addOrder = async (orderData) => {
  const {
    employee_id,
    customer_id,
    vehicle_id,
    order_description,
    order_services,
  } = orderData;

  try {
    // Insert into orders table with UUID
    const orderResult = await query(
      `INSERT INTO orders (employee_id, customer_id, vehicle_id, active_order, order_hash) 
       VALUES (?, ?, ?, ?, UUID())`,
      [employee_id, customer_id, vehicle_id, 0]
    );

    if (orderResult.affectedRows === 0) {
      throw new Error("Failed to create order");
    }

    const order_id = orderResult.insertId;

    // Retrieve order_hash using the new order_id
    const [orderHashRow] = await query(
      `SELECT order_hash FROM orders WHERE order_id = ?`,
      [order_id]
    );
    const order_hash = orderHashRow?.order_hash;

    // Insert into order_info table
    await query(
      `INSERT INTO order_info (order_id, order_total_price, additional_request, notes_for_internal_use, notes_for_customer, additional_requests_completed) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, 0, order_description || null, null, null, 0]
    );

    // Insert into order_services table
    for (const service_id of order_services) {
      await query(
        `INSERT INTO order_services (order_id, service_id, service_completed) VALUES (?, ?, ?)`,
        [order_id, service_id, 0]
      );
    }

    // Insert into order_status table
    await query(
      `INSERT INTO order_status (order_id, order_status) VALUES (?, ?)`,
      [order_id, 0]
    );

    // Fetch customer email
    const [customerRow] = await query(
      `SELECT customer_email FROM customer_identifier WHERE customer_id = ?`,
      [customer_id]
    );
    const customer_email = customerRow?.customer_email;

    return {
      success: true,
      order_id,
      order_hash,
      customer_email,
    };
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

const getAllOrders = async () => {
  try {
    const orders = await query(`
      SELECT 
  o.order_id,
  o.order_date,
  o.order_hash,

  -- Employee
  CONCAT(ei.employee_first_name, ' ', ei.employee_last_name) AS received_by,

  -- Customer
  CONCAT(ci.customer_first_name, ' ', ci.customer_last_name) AS customer_name,
  cid.customer_email AS customer_email,
  cid.customer_phone_number AS customer_phone,

  -- Vehicle
  v.vehicle_make,
  v.vehicle_model,
  v.vehicle_year,
  v.vehicle_tag AS plate_number,

  -- Status
  os.order_status

FROM orders o
LEFT JOIN customer_identifier cid ON o.customer_id = cid.customer_id
LEFT JOIN customer_info ci ON ci.customer_id = cid.customer_id
LEFT JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
LEFT JOIN employee e ON o.employee_id = e.employee_id
LEFT JOIN employee_info ei ON ei.employee_id = e.employee_id
LEFT JOIN order_status os ON o.order_id = os.order_id
ORDER BY o.order_id DESC;

    `);

    return orders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

// const getOrderById = async (orderId) => {
//   try {
//     // Fetch order details with order status
//     const orders = await query(
//       `
//       SELECT
//         o.order_id,
//         o.employee_id,
//         o.customer_id,
//         o.vehicle_id,
//         oi.additional_request AS order_description,
//         o.order_date,
//         oi.estimated_completion_date,
//         oi.completion_date,
//         oi.additional_requests_completed AS order_completed,
//         os.order_status AS status
//       FROM orders o
//       LEFT JOIN order_info oi ON o.order_id = oi.order_id
//       LEFT JOIN order_status os ON o.order_id = os.order_id
//       WHERE o.order_id = ?
//       `,
//       [orderId]
//     );

//     if (orders.length === 0) {
//       return null; // No order found
//     }

//     // Fetch related services
//     const services = await query(
//       `
//       SELECT service_id
//       FROM order_services
//       WHERE order_id = ?
//       `,
//       [orderId]
//     );

//     return {
//       ...orders[0],
//       order_services: services.map((s) => ({ service_id: s.service_id })),
//     };
//   } catch (error) {
//     console.error("Error in getOrderById:", error);
//     throw error;
//   }
// };

const getOrderByHash = async (orderHash) => {
  try {
    // Fetch full order with customer and vehicle info using order_hash
    const orderResult = await query(
      `
      SELECT 
        o.order_id,
        o.order_date,
        o.order_hash,
        os.order_status,

        -- Customer info
        ci.customer_first_name,
        ci.customer_last_name,
        cid.customer_email,
        cid.customer_phone_number,
        ci.active_customer_status,

        -- Vehicle info
        v.vehicle_make,
        v.vehicle_year,
        v.vehicle_mileage,
        v.vehicle_tag,

        -- Order info
        oi.additional_request,
        oi.estimated_completion_date,
        oi.completion_date,
        oi.additional_requests_completed AS order_completed

      FROM orders o
      LEFT JOIN order_info oi ON o.order_id = oi.order_id
      LEFT JOIN order_status os ON o.order_id = os.order_id
      LEFT JOIN customer_identifier cid ON o.customer_id = cid.customer_id
      LEFT JOIN customer_info ci ON cid.customer_id = ci.customer_id
      LEFT JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
      WHERE o.order_hash = ?
      `,
      [orderHash]
    );

    const order = orderResult; // assuming conn.query returns [rows, fields]
    // console.log(order)
    if (!order) return null;

    // Get all services related to this order
    const servicesResult = await query(
      `
      SELECT cs.service_name
      FROM order_services os
      LEFT JOIN common_services cs ON os.service_id = cs.service_id
      WHERE os.order_id = ?
      `,
      [order[0].order_id] // still use order_id here to fetch services
    );

    const services = servicesResult.map((s) => s.service_name);

    return {
      ...order,
      services,
    };
  } catch (error) {
    console.error("Error in getOrderByHash:", error);
    throw error;
  }
};

const updateOrder = async (orderId, updateData) => {
  try {
    let orderUpdateFields = [];
    let orderValues = [];

    let orderInfoUpdateFields = [];
    let orderInfoValues = [];

    let orderStatusUpdateFields = [];
    let orderStatusValues = [];
    orderStatusUpdateFields;
    // Helper function to safely handle undefined values
    const safeValue = (value) => (value !== undefined ? value : null);

    // Update fields for the `orders` table
    if (updateData.employee_id !== undefined) {
      orderUpdateFields.push("employee_id = ?");
      orderValues.push(safeValue(updateData.employee_id));
    }
    if (updateData.customer_id !== undefined) {
      orderUpdateFields.push("customer_id = ?");
      orderValues.push(safeValue(updateData.customer_id));
    }
    if (updateData.vehicle_id !== undefined) {
      orderUpdateFields.push("vehicle_id = ?");
      orderValues.push(safeValue(updateData.vehicle_id));
    }

    // If any fields in the `orders` table need to be updated
    if (orderUpdateFields.length > 0) {
      orderValues.push(orderId); // Add orderId for WHERE clause
      await query(
        `UPDATE orders SET ${orderUpdateFields.join(", ")} WHERE order_id = ?`,
        orderValues
      );
    }

    // Update fields for the `order_info` table
    if (updateData.order_description !== undefined) {
      orderInfoUpdateFields.push("additional_request = ?");
      orderInfoValues.push(safeValue(updateData.order_description));
    }
    if (updateData.estimated_completion_date !== undefined) {
      orderInfoUpdateFields.push("estimated_completion_date = ?");
      orderInfoValues.push(safeValue(updateData.estimated_completion_date));
    }
    if (updateData.completion_date !== undefined) {
      orderInfoUpdateFields.push("completion_date = ?");
      orderInfoValues.push(safeValue(updateData.completion_date));
    }
    if (updateData.additional_requests_completed !== undefined) {
      orderInfoUpdateFields.push("additional_requests_completed = ?");
      orderInfoValues.push(safeValue(updateData.additional_requests_completed));
    }

    // If any fields in the `order_info` table need to be updated
    if (orderInfoUpdateFields.length > 0) {
      orderInfoValues.push(orderId); // Add orderId for WHERE clause
      await query(
        `UPDATE order_info SET ${orderInfoUpdateFields.join(
          ", "
        )} WHERE order_id = ?`,
        orderInfoValues
      );
    }
    // Update order status if provided
    if (updateData.order_status !== undefined) {
      // Update order status if provided
      if (updateData.order_status !== undefined) {
        orderStatusUpdateFields.push("order_status = ?");
        orderStatusValues.push(safeValue(updateData.order_status));

        // Update order status in the `order_status` table
        orderStatusValues.push(orderId); // Add orderId for WHERE clause
        await query(
          `UPDATE order_status SET ${orderStatusUpdateFields.join(
            ", "
          )} WHERE order_id = ?`,
          orderStatusValues
        );
      }
    }
    // Update order_services if provided
    if (updateData.order_services) {
      // Delete existing order_services related to this order
      await query(`DELETE FROM order_services WHERE order_id = ?`, [orderId]);

      // Insert the new order_services if they exist
      const serviceValues = updateData.order_services.map((s) => [
        orderId,
        s.service_id,
      ]);
      if (serviceValues.length > 0) {
        await query(
          `INSERT INTO order_services (order_id, service_id) VALUES ?`,
          [serviceValues]
        );
      }
    }

    return { success: true, message: "Order updated successfully" };
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

const updateOrderStatus = async (order_id, order_status) => {
  try {
    const response = await query(
      `UPDATE order_status SET order_status = ? WHERE order_id = ?`,
      [order_status, order_id]
    );
    return response;
  } catch (err) {
    console.error("Error updating order status:", err);
    throw err;
  }
};

// await query(
//   `UPDATE order_status SET ${orderStatusUpdateFields.join(", ")} WHERE order_id = ?`,
//   orderStatusValues
// );

const deleteOrder = async (order_id) => {
  try {
    // Delete from order_services first due to foreign key constraints
    await query(`DELETE FROM order_services WHERE order_id = ?`, [order_id]);

    // Delete from order_status
    await query(`DELETE FROM order_status WHERE order_id = ?`, [order_id]);

    // Delete from order_info
    await query(`DELETE FROM order_info WHERE order_id = ?`, [order_id]);

    // Finally, delete from orders table
    const result = await query(`DELETE FROM orders WHERE order_id = ?`, [
      order_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("No order found to delete.");
    }

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Export all service functions using ES6 named export syntax
// Named exports are ideal for service modules that provide multiple related functions
// This allows consumers to import specific functions: import { addOrder, getAllOrders } from './order.service.js'
// or import all functions: import * as orderService from './order.service.js'
export {
  addOrder,
  getAllOrders,
  // getOrderById,
  updateOrder,
  updateOrderStatus,
  getOrderByHash,
  deleteOrder,
};
