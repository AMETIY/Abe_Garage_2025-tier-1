import React, { useEffect, useState } from "react";
import createCustomer from "../../../../services/customer.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import { FaEdit } from "react-icons/fa";
import { Table, Button } from "react-bootstrap";
import vehicleService from "../../../../services/vehicle.service";
import { MdAdsClick } from "react-icons/md";
import ServiceListCard from "../../ServiceLIst/ServiceList";
import serviceServices from "../../../../services/service.service";
import ServiceCard from "../../ServiceLIst/ServiceCard";
import AddService from "../AddService/AddService";
import AdditionalRequests from "../AdditionalRequests/AdditionalRequests";
import Loader from "../../Loader/Loader";

const NewOrdersThree = ({ customer_id, vehicle_id }) => {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicle] = useState([]);
  const [services, setServices] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // Destructure the auth hook and get the token
  const { employee } = useAuth();

  useEffect(() => {
    if (!(employee && employee.employee_token)) return;
    const loggedInEmployeeToken = employee.employee_token;
    setIsLoading(true);
    createCustomer
      .getSingleCustomer(customer_id, loggedInEmployeeToken)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (!data) {
          setIsLoading(false);
        } else {
          setCustomers(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
      });

    setIsLoading(true);
    vehicleService
      .getVehicle(loggedInEmployeeToken, vehicle_id)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (!data) {
          setIsLoading(false);
        } else {
          setVehicle(data.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });

    // Fetch services and set them
    serviceServices
      .getAllServices(loggedInEmployeeToken)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setServices(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [employee, customer_id, vehicle_id]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <section className="contact-section pl-0">
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
              <div class="history-block mt-3 history-blocktwo">
                <div class="content">
                  <h4>{vehicles.vehicle_make}</h4>
                  <div class="text">
                    <div>
                      {" "}
                      <b style={{ color: "#08194A" }}>vehicle color: </b>{" "}
                      {vehicles.vehicle_color}
                    </div>
                    <div>
                      {" "}
                      <b style={{ color: "#08194A" }}>vehicle tag: </b>{" "}
                      {vehicles.vehicle_tag}
                    </div>
                    <div>
                      {" "}
                      <b style={{ color: "#08194A" }}>vehicle year: </b>{" "}
                      {vehicles.vehicle_year}
                    </div>
                    <div>
                      {" "}
                      <b style={{ color: "#08194A" }}>vehicle mileage: </b>{" "}
                      {vehicles.vehicle_mileage}
                    </div>
                    <div>
                      {" "}
                      <b style={{ color: "#08194A" }}>vehicle serial: </b>{" "}
                      {vehicles.vehicle_serial}
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
              <div className="row clearfix history-blocktwo mt-4">
                {services.map((service) => (
                  <ServiceCard key={service.service_id} service={service} />
                ))}
                <AdditionalRequests
                  customer_id={customer_id}
                  vehicle_id={vehicles.vehicle_id}
                />
              </div>
            </section>
          </div>
        </section>
      )}
    </>
  );
};

export default NewOrdersThree;
