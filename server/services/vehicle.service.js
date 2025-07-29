import { query } from "../config/db.config.js";

const addNewVehicle = async (vehicleData) => {
  try {
    const {
      customer_id,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_type,
      vehicle_mileage,
      vehicle_tag,
      vehicle_serial,
      vehicle_color,
    } = vehicleData;

    const sql = `
      INSERT INTO customer_vehicle_info (customer_id, vehicle_year, vehicle_make, vehicle_model, vehicle_type, 
                            vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    await query(sql, [
      customer_id,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_type,
      vehicle_mileage,
      vehicle_tag,
      vehicle_serial,
      vehicle_color,
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error adding new vehicle:", error);
    throw error;
  }
};

const getVehicleById = async (vehicleId) => {
  try {
    const sql = `
       SELECT 
    v.vehicle_id,
    v.customer_id,
    v.vehicle_year,
    v.vehicle_make,
    v.vehicle_model,
    v.vehicle_type,
    v.vehicle_mileage,
    v.vehicle_tag,
    v.vehicle_serial,
    v.vehicle_color,
    c.customer_email,
    c.customer_phone_number,
    c.customer_added_date,
    c.customer_hash,
    ci.customer_info_id,
    ci.customer_first_name,
    ci.customer_last_name,
    ci.active_customer_status
FROM customer_vehicle_info v
INNER JOIN customer_identifier c ON v.customer_id = c.customer_id
INNER JOIN customer_info ci ON v.customer_id = ci.customer_id
WHERE v.vehicle_id = ?;

      `;

    const rows = await query(sql, [vehicleId]);

    if (rows.length === 0) {
      return null; // No vehicle found
    }

    return rows[0]; // Return vehicle details
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
};

const getVehiclesByCustomerId = async (customerId) => {
  try {
    const sql = `
            SELECT 
                v.vehicle_id,
                v.customer_id,
                v.vehicle_year,
                v.vehicle_make,
                v.vehicle_model,
                v.vehicle_type,
                v.vehicle_mileage,
                v.vehicle_tag,
                v.vehicle_serial,
                v.vehicle_color
            FROM customer_vehicle_info v
            WHERE v.customer_id = ?;
        `;

    const vehicles = await query(sql, [customerId]);

    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

const updateVehicleInfo = async (vehicleId, updateFields) => {
  try {
    const validFields = [
      "vehicle_year",
      "vehicle_make",
      "vehicle_model",
      "vehicle_type",
      "vehicle_mileage",
      "vehicle_tag",
      "vehicle_serial",
      "vehicle_color",
    ];

    const setClause = [];
    const values = [];

    Object.entries(updateFields).forEach(([key, value]) => {
      if (validFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setClause.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    values.push(vehicleId); // Add the vehicle ID at the end

    const sql = `
            UPDATE customer_vehicle_info 
            SET ${setClause.join(", ")}
            WHERE vehicle_id = ?;
        `;

    const result = await query(sql, values);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating vehicle info:", error);
    throw error;
  }
};

const getAllVehicles = async () => {
  try {
    const sql = `SELECT * FROM customer_vehicle_info`;
    const vehicles = await query(sql);
    return vehicles;
  } catch (error) {
    console.error("Error fetching all vehicles:", error);
    throw error;
  }
};

// Export all service functions using ES6 named export syntax
// Named exports are ideal for service modules that provide multiple related functions
// This allows consumers to import specific functions: import { addNewVehicle, getVehicleById } from './vehicle.service.js'
// or import all functions: import * as vehicleService from './vehicle.service.js'
export {
  addNewVehicle,
  getVehicleById,
  getVehiclesByCustomerId,
  updateVehicleInfo,
  getAllVehicles,
};
