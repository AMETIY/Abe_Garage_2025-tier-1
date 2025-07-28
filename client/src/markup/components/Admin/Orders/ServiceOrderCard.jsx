// ServiceOrderCard.js
import React from "react";
import { Card } from "react-bootstrap";

const ServiceOrderCard = ({ service, checked, onCheckChange }) => {
  return (
    <Card className="shadow-sm my-1 w-100">
      <Card.Body className="py-3">
        <div className="d-flex align-items-center justify-content-between">
          <Card.Title className="fw-bold mb-0 style-two">
            <h4 className="mb-0 fw-bold">{service.service_name}</h4>
          </Card.Title>

          {/* Checkbox here */}
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheckChange(service.service_id)}
          />
        </div>
        <Card.Text className="text-muted mt-2">
          {service.service_description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ServiceOrderCard;
