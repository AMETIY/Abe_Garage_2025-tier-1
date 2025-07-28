import * as serviceService from "../services/service.service.js";
import {
  asyncHandler,
  sendSuccessResponse,
} from "../middlewares/errorHandler.middleware.js";
import ApiError from "../utils/ApiError.js";

const addService = asyncHandler(async (req, res) => {
  const { service_name, service_description } = req.body;

  // Validate required fields
  if (!service_name) {
    throw ApiError.validation("Service name is required");
  }

  const result = await serviceService.addService(
    service_name,
    service_description
  );

  if (result.success) {
    sendSuccessResponse(
      res,
      { service_id: result.service_id },
      "Service created successfully",
      201
    );
  } else {
    throw ApiError.database("Failed to create service");
  }
});
const getAllServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getAllServices();

  // Check if services exist
  if (!services || services.length === 0) {
    sendSuccessResponse(res, [], "No services found");
    return;
  }

  sendSuccessResponse(res, services, "Services retrieved successfully");
});

const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate if ID is a number
  if (isNaN(id)) {
    throw ApiError.validation("Invalid service ID");
  }

  const service = await serviceService.getServiceById(id);

  if (!service) {
    throw ApiError.notFound("Service");
  }

  sendSuccessResponse(res, service, "Service retrieved successfully");
});
const updateService = asyncHandler(async (req, res) => {
  const { service_id, service_name, service_description } = req.body;

  // Validate service ID
  if (!service_id || isNaN(service_id)) {
    throw ApiError.validation("Invalid service ID");
  }

  // Ensure at least one field is provided for update
  if (!service_name && !service_description) {
    throw ApiError.validation("At least one field is required to update");
  }

  // Call service layer function
  const success = await serviceService.updateService(
    service_id,
    service_name,
    service_description
  );

  if (!success) {
    throw ApiError.notFound("Service");
  }

  sendSuccessResponse(res, null, "Service updated successfully");
});

const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    throw ApiError.validation("Invalid service ID");
  }

  const result = await serviceService.deleteService(id);

  if (!result?.success) {
    if (result?.message?.includes("linked to existing orders")) {
      throw ApiError.conflict(result.message);
    } else if (result?.message?.includes("not found")) {
      throw ApiError.notFound("Service");
    } else {
      throw ApiError.database(result?.message || "Failed to delete service");
    }
  }

  sendSuccessResponse(res, null, "Service deleted successfully");
});

export {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
