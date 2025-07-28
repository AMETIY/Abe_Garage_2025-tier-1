import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Button, Row, Col } from "react-bootstrap";
import createCustomer from "../../../../services/customer.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import { FaEdit, FaPlus, FaFilter } from "react-icons/fa";
import { MdAdsClick } from "react-icons/md";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Loader from "../../Loader/Loader";
import CustomerSearch from "./CustomerSearch";
import PaginationComponent from "../../Common/PaginationComponent/PaginationComponent";
import "./CustomerList.css";

/**
 * CustomerList - Displays a paginated list of customers with status filtering
 *
 * @param {string} searchTerm - Search term for filtering customers
 * @param {boolean} showInactive - Whether to show inactive customers
 * @param {function} onSearchChange - Callback when search term changes
 * @param {function} onStatusToggle - Callback when status filter is toggled
 */
const CustomerList = ({
  searchTerm = "",
  showInactive = false,
  onSearchChange,
  onStatusToggle,
}) => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { employee } = useAuth();
  const token = employee?.employee_token;

  // Filter customers based on search term and status
  const filteredCustomers = useMemo(() => {
    try {
      let filtered = customers;

      // Filter by active/inactive status
      if (showInactive) {
        filtered = filtered.filter(
          (customer) => !customer.active_customer_status
        );
      } else {
        filtered = filtered.filter(
          (customer) => customer.active_customer_status
        );
      }

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((customer) => {
          const firstName = customer.customer_first_name?.toLowerCase() || "";
          const lastName = customer.customer_last_name?.toLowerCase() || "";
          const email = customer.customer_email?.toLowerCase() || "";
          const phone = customer.customer_phone_number?.toLowerCase() || "";

          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower)
          );
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      return [];
    }
  }, [customers, searchTerm, showInactive]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
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

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;

      setIsLoading(true);
      setApiError(false);

      try {
        const response = await createCustomer.getAllCustomer(token);

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

        if (data.data && data.data.length > 0) {
          setCustomers(data.data);
        } else {
          setCustomers([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setApiError(true);
        setApiErrorMessage("Failed to load customers. Please try again.");
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showInactive]);

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
                    <h2 className="page-title mb-1">Customer Management</h2>
                    <p className="page-subtitle text-muted mb-0">
                      Manage your customer database and relationships
                    </p>
                  </div>
                </Col>
                <Col xs={12} sm={4} md={4} lg={4}>
                  <div className="add-customer-button-container">
                    <Button
                      variant="primary"
                      href="/admin/add-customer"
                      className="add-customer-btn w-100"
                      size="lg"
                    >
                      <FaPlus size={14} />
                      <span className="btn-text">Add Customer</span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Search and Filter Controls */}
            <div className="search-filter-container mb-4">
              <Row className="g-3">
                <Col lg={8} md={7} sm={12}>
                  <CustomerSearch
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                  />
                </Col>
                <Col lg={4} md={5} sm={12}>
                  <div className="filter-controls d-flex align-items-end h-100">
                    <Button
                      variant={showInactive ? "danger" : "success"}
                      onClick={onStatusToggle}
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        minHeight: "48px",
                        boxShadow: showInactive
                          ? "0 2px 4px rgba(220, 53, 69, 0.2)"
                          : "0 2px 4px rgba(40, 167, 69, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = showInactive
                          ? "0 4px 8px rgba(220, 53, 69, 0.3)"
                          : "0 4px 8px rgba(40, 167, 69, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = showInactive
                          ? "0 2px 4px rgba(220, 53, 69, 0.2)"
                          : "0 2px 4px rgba(40, 167, 69, 0.2)";
                      }}
                    >
                      <FaFilter size={14} />
                      {showInactive ? "Show Active" : "Show Inactive"}
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Customer Count */}
            <div className="customer-count-section mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="customer-count text-muted">
                  {filteredCustomers.length}{" "}
                  {showInactive ? "inactive" : "active"} customer
                  {filteredCustomers.length !== 1 ? "s" : ""}
                  {searchTerm && ` (filtered)`}
                </div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="customers-table-container">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Added Date</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {searchTerm
                          ? `No ${
                              showInactive ? "inactive" : "active"
                            } customers found matching your search criteria.`
                          : `No ${
                              showInactive ? "inactive" : "active"
                            } customers found.`}
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.customer_id}>
                        <td>{customer.customer_id}</td>
                        <td>{customer.customer_first_name}</td>
                        <td>{customer.customer_last_name}</td>
                        <td className="text-break">
                          {customer.customer_email}
                        </td>
                        <td>{customer.customer_phone_number}</td>
                        <td>
                          {customer.customer_added_date
                            ? (() => {
                                try {
                                  const date = new Date(
                                    customer.customer_added_date
                                  );
                                  if (
                                    isNaN(date.getTime()) ||
                                    date.getTime() < 0
                                  ) {
                                    return "Invalid Date";
                                  }
                                  try {
                                    return format(date, "MM/dd/yyyy");
                                  } catch {
                                    return "Invalid Date";
                                  }
                                } catch {
                                  return "Invalid Date";
                                }
                              })()
                            : "N/A"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              customer.active_customer_status
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {customer.active_customer_status ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <a
                              href={`/admin/customer/edit/${customer.customer_id}`}
                              className="text-decoration-none"
                              title="Edit Customer"
                            >
                              <Button variant="link" className="p-0">
                                <FaEdit className="text-primary" size={18} />
                              </Button>
                            </a>
                            <a
                              href={`/admin/customers/${customer.customer_id}`}
                              className="text-decoration-none"
                              title="View Customer"
                            >
                              <Button variant="link" className="p-0">
                                <ExternalLink
                                  className="text-secondary"
                                  style={{ width: 18, height: 18 }}
                                />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
              <div className="pagination-section mt-4">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={filteredCustomers.length}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default CustomerList;
