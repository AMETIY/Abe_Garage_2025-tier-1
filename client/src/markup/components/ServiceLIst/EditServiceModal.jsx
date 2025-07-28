import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditServiceModal = ({ show, onHide, service, onSave }) => {
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  useEffect(() => {
    if (service) {
      setServiceName(service.service_name || "");
      setServiceDescription(service.service_description || "");
    }
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(service.service_id, serviceName, serviceDescription);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="serviceName">
            <Form.Label>Service Name</Form.Label>
            <Form.Control
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="serviceDescription" className="mt-3">
            <Form.Label>Service Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
            />
          </Form.Group>

          <Button
            type="submit"
            className="mt-4 text-white"
            style={{ backgroundColor: "#08194A", borderColor: "#08194A" }}
          >
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditServiceModal;
