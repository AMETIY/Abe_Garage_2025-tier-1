import React, { useState, useCallback } from "react";
// Import the auth hook
import { useAuth } from "../../../Contexts/AuthContext";
// Import the login form component
import LoginForm from "../../components/LoginForm/LoginForm";
// Import the admin menu component
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
import ServiceListCard from "../../components/ServiceLIst/ServiceList";

// Import the EmployeesList component
function ServiceListPage() {
  // Destructure the auth hook
  const { isLogged, isAdmin } = useAuth();

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search term changes
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }, []);

  if (isLogged) {
    if (isAdmin) {
      return (
        <div>
          <div className="container-fluid admin-pages">
            <div className="row">
              <div className="col-md-3 admin-left-side">
                <AdminMenu />
              </div>
              <div className="col-md-9 admin-right-side py-4">
                <ServiceListCard
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h1>You are not authorized to access this page</h1>
        </div>
      );
    }
  } else {
    return (
      <div>
        <LoginForm />
      </div>
    );
  }
}

export default ServiceListPage;
