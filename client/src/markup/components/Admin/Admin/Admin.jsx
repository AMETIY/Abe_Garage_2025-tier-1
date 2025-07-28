import React from "react";

function Admin() {
  return (
    <section className="services-section">
      <div className="auto-container">
        <div className="sec-title style-two">
          <h2>Admin Dashboard</h2>
          <div className="text">
            Bring to the table win-win survival strategies to ensure proactive
            domination. At the end of the day, going forward, a new normal that
            has evolved from generation X is on the runway heading towards a
            streamlined cloud solution.{" "}
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Open for all</h5>
              <h2>All Orders</h2>
              <a href="/admin/orders" className="read-more">
                List of orders +
              </a>
              <div className="icon">
                <span className="flaticon-power"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>open For leads</h5>
              <h2>New Orders</h2>
              <a href="/admin/order" className="read-more">
                Add Order +
              </a>
              <div className="icon">
                <span className="flaticon-gearbox"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Open for admin</h5>
              <h2>Employees</h2>
              <a href="/admin/employees" className="read-more">
                List of employees +
              </a>
              <div className="icon">
                <span className="flaticon-brake-disc"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Open for admin</h5>
              <h2>Add Employee</h2>
              <a href="/admin/add-employee" className="read-more">
                read more +
              </a>
              <div className="icon">
                <span className="flaticon-car-engine"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Service and Repairs</h5>
              <h2>Customers</h2>
              <a href="/admin/customers" className="read-more">
                List of customers +
              </a>
              <div className="icon">
                <span className="flaticon-tire"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Service and Repairs</h5>
              <h2>Add Customer</h2>
              <a href="/admin/add-customer" className="read-more">
                Add customer +
              </a>
              <div className="icon">
                <span className="flaticon-spray-gun"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Service and Repair</h5>
              <h2>Services </h2>
              <a href="/admin/services" className="read-more">
                List of services +
              </a>
              <div className="icon">
                <span className="flaticon-car-engine"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Service and Repairs</h5>
              <h2>Engine Service & repair</h2>
              <a href="#" className="read-more">
                read more +
              </a>
              <div className="icon">
                <span className="flaticon-tire"></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 service-block-one">
            <div className="inner-box hvr-float-shadow">
              <h5>Service and Repairs</h5>
              <h2>Denting & Painting</h2>
              <a href="#" className="read-more">
                read more +
              </a>
              <div className="icon">
                <span className="flaticon-spray-gun"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;
