import { useEffect, useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import orderService from "../../../../services/order.service";
import { useAuth } from "../../../../Contexts/AuthContext";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import Loader from "../../Loader/Loader";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { employee } = useAuth();
  let loggedInEmployeeToken = null;
  if (employee) {
    loggedInEmployeeToken = employee?.employee_token;
  }

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    const token = employee?.employee_token;

    if (!token) {
      console.warn("Token is not available yet.");
      setIsLoading(false);

      return;
    }

    orderService
      .getAllOrders(token)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Orders API response:", data);
        if (!data) {
          setOrders([]);
          setIsLoading(false);
        } else if (Array.isArray(data)) {
          setOrders(data);
          setIsLoading(false);
        } else if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setIsLoading(false);
        } else if (data.data && Array.isArray(data.data)) {
          setOrders(data.data);
          setIsLoading(false);
        } else {
          console.error("Unexpected data format:", data);
          setOrders([]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setIsLoading(false);
      });
  }, [employee]);

  useEffect(() => {
    if (employee?.employee_token) {
      fetchOrders();
    }
  }, [employee, fetchOrders]);

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status.toString());
    setShowModal(true);
  };

  const handleSaveStatus = async () => {
    try {
      const res = await orderService.updateOrderStatus(
        selectedOrder.order_id,
        parseInt(newStatus),
        loggedInEmployeeToken
      );
      if (res.ok) {
        setShowModal(false);
        fetchOrders(); // Refresh orders
      } else {
        console.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirm) return;

    const token = employee?.employee_token;
    if (!token) {
      console.warn("Token is not available yet.");
      return;
    }
    orderService
      .deleteOrder(id, token)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setOrders((prev) => prev.filter((ord) => ord.order_id !== id));
        }
      });
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <section className="contact-section">
          <div
            className="auto-container table-responsive"
            style={{ overflowX: "auto" }}
          >
            <div className="contact-title">
              <h2>Orders</h2>
            </div>

            <table className="table table-striped table-bordered table-hover text-sm">
              <thead className="table-light">
                <tr>
                  <th>Order Id</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Order Date</th>
                  <th>Received by</th>
                  <th>Order Status</th>
                  <th>View/Edit</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.order_id}>
                      <td className="fw-bold">{order.order_id}</td>
                      <td>
                        <div className="fw-medium">{order.customer_name}</div>
                        <div className="text-muted small">
                          {order.customer_email}
                        </div>
                        <div className="text-muted small">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {order.vehicle_make} {order.vehicle_model}
                        </div>
                        <div className="text-muted">{order.vehicle_year}</div>
                        <div className="text-muted">{order.plate_number}</div>
                      </td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>{order.received_by}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            order.order_status === 2
                              ? "bg-success text-white"
                              : order.order_status === 1
                              ? "bg-warning text-dark"
                              : "bg-dark text-white"
                          }`}
                        >
                          {order.order_status === 2
                            ? "Completed"
                            : order.order_status === 1
                            ? "In Progress"
                            : "Received"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <a>
                            <FaRegEdit
                              className="text-dark cursor-pointer mr-2"
                              size={18}
                              onClick={() => handleEditClick(order)}
                            />
                          </a>

                          <a href={`/admin/order/${order.order_hash}`}>
                            <ExternalLink
                              className="text-secondary"
                              style={{ width: 16, height: 16 }}
                            />
                          </a>
                          <a onClick={() => handleDelete(order.order_id)}>
                            <FaTrashAlt
                              className="text-danger cursor-pointer ml-2"
                              size={16}
                            />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* STATUS UPDATE MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Update Order Status</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="orderStatus">
                    <Form.Label className="m-3">Status</Form.Label>
                    <Form.Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="0">Received</option>
                      <option value="1">In Progress</option>
                      <option value="2">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveStatus}
                  className="text-white"
                  style={{ backgroundColor: "#08194A", borderColor: "#08194A" }}
                >
                  Save
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </section>
      )}
    </>
  );
}
