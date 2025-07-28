import React from "react";
import { useAuth } from "../../../Contexts/AuthContext";
import LoginForm from "../../components/LoginForm/LoginForm";
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
import PerformanceDashboard from "../../components/Admin/PerformanceDashboard/PerformanceDashboard";

/**
 * Performance Page - Admin only
 * Displays comprehensive performance monitoring dashboard
 */
const PerformancePage = () => {
  const { isLogged, isAdmin } = useAuth();

  if (!isLogged) {
    return <LoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger text-center">
              <h4>Access Denied</h4>
              <p>You are not authorized to access the performance dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid admin-pages">
        <div className="row">
          <div className="col-md-3 admin-left-side">
            <AdminMenu />
          </div>
          <div className="col-md-9 admin-right-side py-4">
            <PerformanceDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
