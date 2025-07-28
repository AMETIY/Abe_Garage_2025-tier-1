import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import createCustomer from "../../../../services/customer.service";
import vehicleService from "../../../../services/vehicle.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import Vehicle from "../Vehicles/Vehicle";
import { Table, Button } from "react-bootstrap";

const AddVehicle = ({ id }) => {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicle] = useState([]);
  const [vehicle_type, setvehicleType] = useState("");

  const [serverError, setServerError] = useState("");
  const [vehicle_model, setVehicleModel] = useState("");
  const [vehicle_make, setVehicleMake] = useState("");
  const [vehicle_color, setVehicleColor] = useState("");
  const [vehicle_serial, setVehicleserial] = useState("");
  const [vehicle_tag, setVehicleTag] = useState("");
  const [vehicle_mileage, setVehicleMileage] = useState("");

  const [success, setSuccess] = useState("");
  const [vehicle_year, setVehicleYear] = useState("");

  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Destructure the auth hook and get the token
  const { employee } = useAuth();
  useEffect(() => {
    if (employee && employee.employee_token) {
      const loggedInEmployeeToken = employee.employee_token;
      createCustomer
        .getSingleCustomer(id, loggedInEmployeeToken)
        .then((response) => response.json())
        .then((data) => {
          // console.log("here -> ",data);
          // If Error is returned from the API server, set the error message
          if (!data) {
            setServerError("data error");
          } else {
            // Handle successful response
            setCustomers(data);
          }
        })
        .catch((err) => {
          console.log(err);
        });

      vehicleService
        .getVehiclesByCustomer(loggedInEmployeeToken, id)
        .then((response) => response.json())
        .then((data) => {
          // console.log("here -> ",data);
          // If Error is returned from the API server, set the error message
          if (!data) {
            setServerError("data error");
          } else {
            // Handle successful response
            setVehicle(data.vehicles);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [employee, id]);

  const handleSubmit = (e) => {
    // Prevent the default behavior of the form
    e.preventDefault();
    // Handle client side validations
    let valid = true; // Flag
    // First name is required
    if (
      !vehicle_year ||
      !vehicle_make ||
      !vehicle_model ||
      !vehicle_serial ||
      !vehicle_tag ||
      !vehicle_color ||
      !vehicle_mileage
    ) {
      setServerError("All fields are required");
      valid = false;
    }

    // If the form is not valid, do not submit
    if (!valid) {
      return;
    }
    const formData = {
      customer_id: id,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_type,
      vehicle_mileage,
      vehicle_tag,
      vehicle_serial,
      vehicle_color,
    };
    // Pass the form data to the service
    const newcustomer = vehicleService.createVehicle(
      formData,
      employee?.employee_token
    );
    newcustomer
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        // If Error is returned from the API server, set the error message
        if (!data) {
          setServerError("data error");
        } else {
          // Handle successful response
          setSuccess(true);
          setServerError("");
          // Redirect to the customers page after 2 seconds
          // For now, just redirect to the home page
          setTimeout(() => {
            window.location.href = `/admin/customers/${id}`;
            // window.location.href = '/';
          }, 2000);
        }
      })
      // Handle Catch
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setServerError(resMessage);
      });
  };

  return (
    <section className="contact-section">
      <div className="auto-container">
        <section class="history-section">
          <div class="auto-container">
            <div class="history-block">
              <div class="years">Info</div>
              <div class="content">
                <h4>Customer: {customers.customer_first_name}</h4>
                <div class="text">
                  <div>
                    {" "}
                    <b style={{ color: "#08194A" }}>Email:</b>{" "}
                    {customers.customer_email}
                  </div>
                  <div>
                    {" "}
                    <b style={{ color: "#08194A" }}>Phone:</b>{" "}
                    {customers.customer_phone_number}
                  </div>
                  <div>
                    {" "}
                    <b style={{ color: "#08194A" }}>Active Customer:</b>{" "}
                    {customers.active_customer_status == 1 ? "Yes" : "No"}
                  </div>
                  <div>
                    {" "}
                    <b style={{ color: "#08194A" }}> Edit Customer Info:</b>
                    <a href={`/admin/customers/`} className="pr-3 pl-3">
                      <button>
                        <FaEdit />
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div class="history-block">
              <div class="years">Cars</div>
              <div class="content">
                <h4>Vehicles of Adugna</h4>
                <div class="text">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>vehicle</th>
                        <th> Model</th>
                        <th> Type</th>
                        <th>mileage</th>
                        <th>Tag</th>
                        <th>Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!vehicles ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No vehicles found
                          </td>
                        </tr>
                      ) : (
                        vehicles?.map((employee) => (
                          <tr key={employee.employee_id}>
                            <td>{employee.vehicle_make}</td>
                            <td>{employee.vehicle_model}</td>
                            <td>{employee.vehicle_type}</td>
                            <td>{employee.vehicle_mileage}</td>
                            <td>{employee.vehicle_tag}</td>
                            <td>{employee.vehicle_color}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              {showAddCustomer && (
                <section
                  className="contact-section my-5"
                  style={{ backgroundColor: "#ffff" }}
                >
                  <div className="auto-container">
                    <div className="contact-title pl-5">
                      <h2>Add a new Vehicle</h2>
                    </div>
                    <div className="row clearfix">
                      <div className="form-column col-lg-9 px-5">
                        <div className="inner-column">
                          <div className="contact-form">
                            <form onSubmit={handleSubmit}>
                              <div className="row clearfix">
                                <div className="form-group col-md-12">
                                  {serverError && (
                                    <div
                                      className="validation-error"
                                      role="alert"
                                    >
                                      {serverError}
                                    </div>
                                  )}
                                  {success && (
                                    <div
                                      className="success-message"
                                      role="alert"
                                    >
                                      C
                                      {serverError && (
                                        <div
                                          className="validation-error"
                                          role="alert"
                                        >
                                          {serverError}
                                        </div>
                                      )}
                                      ustomer added successfully
                                    </div>
                                  )}
                                  <input
                                    type="number"
                                    name="vehicle_year"
                                    value={vehicle_year}
                                    onChange={(event) =>
                                      setVehicleYear(event.target.value)
                                    }
                                    placeholder="Vehicle Year (e.g., 2023)"
                                    min="1900"
                                    max="2030"
                                  />
                                </div>
                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_make"
                                    value={vehicle_make}
                                    onChange={(event) =>
                                      setVehicleMake(event.target.value)
                                    }
                                    placeholder="Vehicle Make (e.g., Toyota, Honda, Ford)"
                                  />
                                  {/* {firstNameRequired && <div className="validation-error" role="alert">{firstNameRequired}</div>} */}
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_model"
                                    value={vehicle_model}
                                    onChange={(event) =>
                                      setVehicleModel(event.target.value)
                                    }
                                    placeholder="Vehicle Model (e.g., Camry, Civic, F-150)"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_type"
                                    value={vehicle_type}
                                    onChange={(event) =>
                                      setvehicleType(event.target.value)
                                    }
                                    placeholder="vehicle type"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_mileage"
                                    value={vehicle_mileage}
                                    onChange={(event) =>
                                      setVehicleMileage(event.target.value)
                                    }
                                    placeholder="vehicle_mileage"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_tag"
                                    value={vehicle_tag}
                                    onChange={(event) =>
                                      setVehicleTag(event.target.value)
                                    }
                                    placeholder="vehicle tag"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_serial"
                                    value={vehicle_serial}
                                    onChange={(event) =>
                                      setVehicleserial(event.target.value)
                                    }
                                    placeholder="vehicle serial"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <input
                                    type="text"
                                    name="vehicle_color"
                                    value={vehicle_color}
                                    onChange={(event) =>
                                      setVehicleColor(event.target.value)
                                    }
                                    placeholder="vehicle color"
                                    required
                                  />
                                </div>

                                <div className="form-group col-md-12">
                                  <button
                                    className="theme-btn btn-style-one"
                                    type="submit"
                                    data-loading-text="Please wait..."
                                  >
                                    <span>Add vehicle</span>
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              <button
                onClick={() => setShowAddCustomer(!showAddCustomer)}
                className="theme-btn btn-style-one"
              >
                {showAddCustomer ? "Cancel" : "Add vehicle"}
              </button>
            </div>
            <div class="history-block">
              <div class="years">Orders</div>
              <div class="content">
                <h4>Orders Of adugna</h4>
                <div class="text">
                  Nor again is there anyone who loves or pursues or desires to
                  obtain pain of itself, because it is pain, but because
                  occasionally circumstances occur in which toil and pain can
                  procure him some great pleasure. To take a trivial example,
                  which of us ever undertakes laborious physical exercise,
                  except to obtain some advantage from it. which of us ever
                  undertakes laborious physical exercise, except to obtain some
                  advantage from it. which of us ever undertakes laborious
                  physical exercise, except to obtain some advantage from it
                  except to obtain some advantage from it.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AddVehicle;
