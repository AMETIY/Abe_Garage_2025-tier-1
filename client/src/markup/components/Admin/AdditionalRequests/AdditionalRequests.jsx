import React, { useEffect, useState } from "react";
import serviceServices from "../../../../services/service.service";
import ServiceCard from "../../ServiceLIst/ServiceCard";

import { useAuth } from "../../../../Contexts/AuthContext";
import { FaEdit } from "react-icons/fa";
import ServiceOrderCard from "../Orders/ServiceOrderCard";
import orderService from "../../../../services/order.service";
import { useNavigate } from "react-router";
const AdditionalRequests = ({ customer_id, vehicle_id }) => {
  const [price, setPrice] = React.useState("");
  const [order_description, setServiceDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [services, setServices] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();

  let loggedInEmployeeToken = "";
  let employee_id = "";
  // Destructure the auth hook and get the token
  const { employee } = useAuth();
  if (employee && employee.employee_token) {
    loggedInEmployeeToken = employee.employee_token;
    employee_id = employee.employee_id;
  }

  const handleServiceToggle = (id) => {
    setSelectedServices(
      (prev) =>
        prev.includes(id)
          ? prev.filter((serviceId) => serviceId !== id) // remove if already selected
          : [...prev, id] // add if not selected
    );
  };

  useEffect(() => {
    //      const vehiclelist = vehicleService
    //            .getVehicle(loggedInEmployeeToken, vehicle_id)
    //            .then((response) => response.json())
    //            .then((data) => {
    //              console.log("here -> ",data.data);
    //              // If Error is returned from the API server, set the error message
    //              if (!data) {
    //                setServerError("data error");
    //              } else {
    //                // Handle successful response
    //                setVehicle(data.data);
    //              }
    //            })
    //            .catch((err) => {
    //              console.log(err);
    //            });

    serviceServices
      .getAllServices(loggedInEmployeeToken)
      .then((response) => response.json())
      .then((data) => {
        // console.log("here -> ",data);
        // If Error is returned from the API server, set the error message
        if (!data) {
          setError(data.error);
        } else {
          // Handle successful response
          setServices(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [loggedInEmployeeToken]);
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      price,
      order_description,
      order_services: selectedServices,
      customer_id,
      vehicle_id,
      employee_id,
    };

    orderService
      .creatOrder(formData, loggedInEmployeeToken)
      .then((response) => response.json())
      .then((data) => {
        // If Error is returned from the API server, set the error message
        if (data && data.error) {
          setError(data.error);
        } else {
          // Handle successful response
          console.info(data);
          setPrice("");
          setServiceDescription("");
          setError("");
          setSuccess(data.message);
          setSelectedServices([]);
          navigate("/admin/orders");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div class="contact-title">
        <h2>choose sevices</h2>
      </div>
      {services.map((service) => (
        <ServiceOrderCard
          key={service.service_id}
          service={service}
          checked={selectedServices.includes(service.service_id)}
          onCheckChange={() => handleServiceToggle(service.service_id)} // ✅ Fix here
        />
      ))}
      <section class="contact-section pl-5 mt-3">
        <div class="auto-container ">
          <div class="contact-title mt-4">
            <h2>Additional Requests</h2>
            <div class="text">
              Praising pain was born and I will give you a complete account of
              the system, and{" "}
            </div>
          </div>
          <div class="row clearfix" style={{ backgroundColor: "#ffff" }}>
            <div class="form-column col-lg-9">
              <div class="inner-column">
                <div class="contact-form">
                  <form onSubmit={handleSubmit}>
                    <div class="row clearfix">
                      <div class="form-group col-md-12">
                        <input />
                        {error && (
                          <div className="alert alert-danger">{error}</div>
                        )}
                        {success && (
                          <div className="alert alert-success">{success}</div>
                        )}
                        {/* {error && <div className="validation-error" role="alert">{error}</div>} */}
                      </div>
                      <div class="form-group col-md-12">
                        <textarea
                          name="order_description"
                          value={order_description}
                          onChange={(event) =>
                            setServiceDescription(event.target.value)
                          }
                          placeholder="service description"
                        ></textarea>
                      </div>

                      <div class="form-group col-md-12">
                        <input
                          type="text"
                          name="service_name"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder="price"
                        />
                      </div>

                      <div class="form-group col-md-12">
                        <input />
                      </div>

                      <div class="form-group col-md-12">
                        <input
                          id="form_botcheck"
                          name="form_botcheck"
                          class="form-control"
                          type="hidden"
                          value=""
                        />
                        <button
                          class="theme-btn btn-style-one"
                          type="submit"
                          data-loading-text="Please wait..."
                        >
                          <span>Submit order</span>
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
    </>
  );
};

export default AdditionalRequests;
