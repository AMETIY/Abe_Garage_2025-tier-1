import { query } from "../config/db.config.js";

// Function to add a new service
async function addService(service_name, service_description) {
  try {
    const sql =
      "INSERT INTO common_services (service_name, service_description) VALUES (?, ?)";
    const row = await query(sql, [service_name, service_description]);

    return { success: row.affectedRows > 0, service_id: row.insertId };
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
}

async function getAllServices() {
  try {
    const sql = "SELECT * FROM common_services";
    const rows = await query(sql);

    return rows;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}
async function getServiceById(params) {
  const sql = `SELECT * FROM common_services WHERE service_id = ?`;
  const [row] = await query(sql, [params]);
  return row;
}
// Function to update a service partially
async function updateService(serviceId, serviceName, serviceDescription) {
  try {
    const updateFields = [];
    const values = [];

    if (serviceName) {
      updateFields.push("service_name = ?");
      values.push(serviceName);
    }
    if (serviceDescription) {
      updateFields.push("service_description = ?");
      values.push(serviceDescription);
    }

    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    values.push(serviceId);
    const sql = `UPDATE common_services SET ${updateFields.join(
      ", "
    )} WHERE service_id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0; // Returns true if update was successful
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
}

async function deleteService(service_id) {
  try {
    // Optional: First check if the service is linked to any existing orders
    const linkedOrders = await query(
      "SELECT * FROM order_services WHERE service_id = ?",
      [service_id]
    );

    if (linkedOrders.length > 0) {
      throw new Error(
        "Cannot delete service: It is linked to existing orders."
      );
    }

    // Delete the service from the common_services table
    const result = await query(
      "DELETE FROM common_services WHERE service_id = ?",
      [service_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Service not found or already deleted.");
    }
    return { success: true, message: "Service deleted successfully" };
  } catch (err) {
    console.error("Error deleting service:", err.message);
    return { success: false, message: err.message };
  }
}

// Export all service functions using ES6 named export syntax
// Named exports are ideal for service modules that provide multiple related functions
// This allows consumers to import specific functions: import { addService, getAllServices } from './service.service.js'
// or import all functions: import * as serviceService from './service.service.js'
export {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
