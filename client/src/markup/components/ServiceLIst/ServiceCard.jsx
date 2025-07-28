import React from "react";
import { Card, Badge } from "react-bootstrap";
import { FaRegEdit, FaTrashAlt, FaCog, FaInfoCircle } from "react-icons/fa";

const ServiceCard = ({ service, handleDelete, handleEditClick }) => {
  return (
    <Card className="service-card shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="service-header d-flex align-items-start justify-content-between mb-3">
          <div className="service-title-section">
            <div className="service-icon mb-2">
              <FaCog size={20} />
            </div>
            <Card.Title className="service-name mb-1">
              {service.service_name}
            </Card.Title>
            <Badge bg="primary" className="service-status-badge">
              Active
            </Badge>
          </div>
          <div className="service-actions d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm action-btn"
              onClick={() => handleEditClick(service)}
              title="Edit Service"
            >
              <FaRegEdit size={14} />
            </button>
            <button
              className="btn btn-outline-danger btn-sm action-btn"
              onClick={() => handleDelete(service.service_id)}
              title="Delete Service"
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        </div>

        <div className="service-content">
          <div className="service-description mb-3">
            <div className="description-header d-flex align-items-center gap-2 mb-2">
              <FaInfoCircle size={14} className="text-muted" />
              <small className="text-muted fw-semibold">Description</small>
            </div>
            <p className="description-text mb-0">
              {service.service_description || "No description available"}
            </p>
          </div>

          <div className="service-meta">
            <div className="meta-item">
              <small className="text-muted">Service ID:</small>
              <span className="meta-value">{service.service_id}</span>
            </div>
            {service.created_at && (
              <div className="meta-item">
                <small className="text-muted">Created:</small>
                <span className="meta-value">
                  {new Date(service.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceCard;
