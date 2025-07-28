import React, { useEffect, useState } from "react";
import createCustomer from "../../../../services/customer.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import { FaEdit } from "react-icons/fa";
import { Table, Button } from "react-bootstrap";
import vehicleService from "../../../../services/vehicle.service";
import { MdAdsClick } from "react-icons/md";
import { useNavigate } from "react-router";
import Loader from "../../Loader/Loader";

const NewOrdersTwo = ({ id }) => {
  console.log("oder two page");
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicle] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigator = useNavigate();

  // Destructure the auth hook and get the token
  const { employee } = useAuth();

  const handleRowClick = (customer_id, vehicle_id) => {
    console.log("curmer", customer_id, vehicle_id);
    navigator(`/admin/ordersthree/${customer_id}/${vehicle_id}`);
  };
  useEffect(() => {
    if (employee && employee.employee_token) {
      const loggedInEmployeeToken = employee.employee_token;
      setIsLoading(true);
      createCustomer
        .getSingleCustomer(id, loggedInEmployeeToken)
        .then((response) => response.json())
        .then((data) => {
          // console.log("here -> ",data);
          // If Error is returned from the API server, set the error message
          if (!data) {
            setIsLoading(false);
          } else {
            // Handle successful response
            setIsLoading(false);
            setCustomers(data);
          }
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });

      setIsLoading(true);
      vehicleService
        .getVehiclesByCustomer(loggedInEmployeeToken, id)
        .then((response) => response.json())
        .then((data) => {
          console.log("here -> ", data);
          // If Error is returned from the API server, set the error message
          if (!data) {
            setIsLoading(false);
          } else {
            // Handle successful response
            setVehicle(data.vehicles);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  }, [employee, id]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <section className="contact-section">
          <div className="auto-container">
            <section class="history-section">
              <div className="contact-title">
                <h2>Create a new order</h2>
              </div>
              <div class="history-block ml-0 history-blocktwo">
                <div class="content">
                  <h4>
                    {customers.customer_first_name}{" "}
                    {customers.customer_last_name}
                  </h4>
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
              <div class="history-block history-blocktwo mt-3">
                <div class="content mt-4">
                  <h4>choose a vehicle</h4>
                  <div class="text">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Make</th>
                          <th> Model</th>
                          <th> Type</th>
                          <th>mileage</th>
                          <th>serial</th>
                          <th>Tag</th>
                          <th>Color</th>
                          <th>choose</th>
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
                            <tr key={employee.vehicle_id}>
                              <td>{employee.vehicle_year}</td>
                              <td>{employee.vehicle_make}</td>
                              <td>{employee.vehicle_model}</td>
                              <td>{employee.vehicle_type}</td>
                              <td>{employee.vehicle_mileage}</td>
                              <td>{employee.vehicle_serial}</td>
                              <td>{employee.vehicle_tag}</td>
                              <td>{employee.vehicle_color}</td>
                              <td>
                                <Button variant="outline" size="sm">
                                  <MdAdsClick
                                    onClick={() =>
                                      handleRowClick(id, employee.vehicle_id)
                                    }
                                  />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      )}
    </>
  );
};

export default NewOrdersTwo;
