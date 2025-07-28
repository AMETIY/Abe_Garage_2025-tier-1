import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Button, Alert } from "react-bootstrap";
import serviceServices from "../../../services/service.service";
import { useAuth } from "../../../Contexts/AuthContext";
import ServiceCard from "./ServiceCard";
import AddService from "../Admin/AddService/AddService";
import EditServiceModal from "./EditServiceModal";
import Loader from "../Loader/Loader";
import PaginationComponent from "../Common/PaginationComponent/PaginationComponent";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import "./ServiceList.css";

/**
 * ServiceList - Displays a paginated list of services with search and filtering
 *
 * @param {string} searchTerm - Search term for filtering services
 * @param {function} onSearchChange - Callback when search term changes
 */
const ServiceListCard = ({ searchTerm = "", onSearchChange }) => {
  // State management
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { employee } = useAuth();
  const token = employee?.employee_token;

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    try {
      let filtered = services;

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((service) => {
          const name = service.service_name?.toLowerCase() || "";
          const description = service.service_description?.toLowerCase() || "";

          return (
            name.includes(searchLower) || description.includes(searchLower)
          );
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      return [];
    }
  }, [services, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle delete service
  const handleDelete = useCallback(
    (id) => {
      const confirm = window.confirm(
        "Are you sure you want to delete this service?"
      );
      if (!confirm) return;

      serviceServices
        .deleteService(id, token)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setServices((prev) =>
              prev.filter((serv) => serv.service_id !== id)
            );
            setSuccess("Service successfully deleted");
            setError("");
          } else if (data.status === "error") {
            setError(data.error?.message || "Delete failed");
            setSuccess("");
          } else {
            // Handle legacy response format
            if (data?.success) {
              setServices((prev) =>
                prev.filter((serv) => serv.service_id !== id)
              );
              setSuccess("Service successfully deleted");
              setError("");
            } else {
              setError(data?.error || "Delete failed");
              setSuccess("");
            }
          }
        })
        .catch((err) => {
          console.error("Delete error:", err);
          setError("Failed to delete service");
          setSuccess("");
        });
    },
    [token]
  );

  // Handle edit click
  const handleEditClick = useCallback((service) => {
    setSelectedService(service);
    setShowEditModal(true);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback(
    (id, name, description) => {
      serviceServices
        .updateService(id, name, description, token)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            setServices((prev) =>
              prev.map((srv) =>
                srv.service_id === id
                  ? {
                      ...srv,
                      service_name: name,
                      service_description: description,
                    }
                  : srv
              )
            );
            setSuccess("Service updated successfully");
            setError("");
            setShowEditModal(false);
          } else {
            setError(data?.error || "Update failed");
          }
        })
        .catch((err) => {
          console.error("Update error:", err);
          setError("An error occurred");
        });
    },
    [token]
  );

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      if (!token) return;

      setIsLoading(true);
      setApiError(false);

      try {
        const response = await serviceServices.getAllServices(token);

        if (!response.ok) {
          setApiError(true);
          if (response.status === 401) {
            setApiErrorMessage("Please login again");
          } else if (response.status === 403) {
            setApiErrorMessage("You are not authorized to view this page");
          } else {
            setApiErrorMessage("Please try again later");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.status === "success") {
          setServices(data.data || []);
        } else if (data.status === "error") {
          setApiError(true);
          setApiErrorMessage(data.error?.message || "Server error");
        } else {
          // Handle legacy response format
          setServices(Array.isArray(data) ? data : []);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setApiError(true);
        setApiErrorMessage("Failed to load services. Please try again.");
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : apiError ? (
        <section className="contact-section">
          <div className="auto-container">
            <div className="contact-title">
              <h2>{apiErrorMessage}</h2>
            </div>
          </div>
        </section>
      ) : (
        <section className="contact-section">
          <div className="auto-container">
            {/* Page Header - Mobile Responsive */}
            <div className="page-header-container mb-3">
              <Row className="align-items-center">
                <Col xs={12} sm={8} md={8} lg={8}>
                  <div className="page-title-section">
                    <h2 className="page-title mb-1">Service Management</h2>
                    <p className="page-subtitle text-muted mb-0">
                      Manage your service offerings and configurations
                    </p>
                  </div>
                </Col>
                <Col xs={12} sm={4} md={4} lg={4}>
                  <div className="add-service-button-container">
                    <Button
                      variant="primary"
                      className="add-service-btn w-100"
                      size="lg"
                      onClick={() => {
                        // Trigger AddService component
                        const addServiceBtn =
                          document.querySelector("[data-add-service]");
                        if (addServiceBtn) addServiceBtn.click();
                      }}
                    >
                      <FaPlus size={14} />
                      <span className="btn-text">Add Service</span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Search Controls */}
            <div className="search-container mb-4">
              <Row className="g-3">
                <Col lg={8} md={7} sm={12}>
                  <div className="search-input-container">
                    <div className="search-icon">
                      <FaSearch size={16} />
                    </div>
                    <input
                      type="text"
                      className="form-control search-input"
                      placeholder="Search services by name or description..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </div>
                </Col>
                <Col lg={4} md={5} sm={12}>
                  <div className="filter-controls d-flex align-items-end h-100">
                    <div className="filter-info">
                      <FaFilter size={14} />
                      <span className="filter-text">
                        {filteredServices.length} of {services.length} services
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Alerts */}
            {success && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setSuccess("")}
              >
                {success}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* Services Grid */}
            <div className="services-grid-container">
              {paginatedServices.length === 0 ? (
                <div className="no-services-container">
                  <div className="no-services-content">
                    <div className="no-services-icon">
                      <FaSearch size={48} />
                    </div>
                    <h3 className="no-services-title">
                      {searchTerm
                        ? "No services found matching your search criteria."
                        : "No services available."}
                    </h3>
                    <p className="no-services-subtitle">
                      {searchTerm
                        ? "Try adjusting your search terms or browse all services."
                        : "Get started by adding your first service."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="services-grid">
                  {paginatedServices.map((service) => (
                    <ServiceCard
                      key={service.service_id}
                      service={service}
                      handleDelete={handleDelete}
                      handleEditClick={handleEditClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredServices.length > 0 && (
              <div className="pagination-container mt-4">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={filteredServices.length}
                />
              </div>
            )}

            {/* Add Service Component (Hidden by default) */}
            <div className="add-service-section" style={{ display: "none" }}>
              <AddService />
            </div>

            {/* Edit Modal */}
            <EditServiceModal
              show={showEditModal}
              onHide={() => setShowEditModal(false)}
              service={selectedService}
              onSave={handleSaveEdit}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default ServiceListCard;
