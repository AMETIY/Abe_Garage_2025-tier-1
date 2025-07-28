// controllers/vehicleController.js

import * as vehicleService from "../services/vehicle.service.js";

const addVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;

    // Call the service to add a new vehicle
    const result = await vehicleService.addNewVehicle(vehicleData);

    if (result.success) {
      return res.status(200).json({ success: "true" });
    } else {
      return res
        .status(400)
        .json({ success: "false", message: "Failed to add vehicle" });
    }
  } catch (error) {
    return res.status(500).json({ success: "false", message: "Server error" });
  }
};

// controllers/vehicleController.js

const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);

    if (!vehicle) {
      return res
        .status(404)
        .json({ status: "error", message: "Vehicle not found" });
    }

    return res.status(200).json({ status: "success", data: vehicle });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

const getVehiclesByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Validate input
    if (!customer_id) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const vehicles = await vehicleService.getVehiclesByCustomerId(customer_id);

    if (vehicles.length === 0) {
      return res
        .status(404)
        .json({ error: "No vehicles found for this customer" });
    }

    res.status(200).json({
      customer_id: Number(customer_id),
      vehicles,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (!id) {
      return res.status(400).json({ error: "Vehicle ID is required" });
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required for update" });
    }

    const updated = await vehicleService.updateVehicleInfo(id, updateFields);

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or no changes made" });
    }

    res
      .status(200)
      .json({ success: true, message: "Vehicle info updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({ status: 'success', data: vehicles });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export { addVehicle, getVehicle, getVehiclesByCustomer, updateVehicle, getAllVehicles };
