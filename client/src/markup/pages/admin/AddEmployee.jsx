import React from "react";
// Import the new EmployeeForm component
import EmployeeForm from "../../components/Admin/Employee/EmployeeForm";
// Import the AdminMenu component
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";

function AddEmployee(props) {
  return (
    <div>
      <div className="container-fluid admin-pages">
        <div className="row">
          <div className="col-md-3 admin-left-side">
            <AdminMenu />
          </div>
          <div className="col-md-9 admin-right-side">
            <section className="contact-section">
              <div className="auto-container">
                <div className="contact-title">
                  <h2>Add New Employee</h2>
                </div>
                <div className="row clearfix">
                  <div className="form-column col-lg-8">
                    <div className="inner-column">
                      <EmployeeForm mode="create" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
