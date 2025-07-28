import React from "react";
import { Card } from "react-bootstrap";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
const OrderServiceCard = ({service,singleOrder}) => {
  console.log("serv- ",service)
    return (
<Card className="shadow-sm my-1 w-100">
<Card.Body className="py-3">
  <div className="d-flex align-items-center justify-content-between">
    <Card.Title className="fw-bold mb-0 style-two">
      <div >

      <h4 className="mb-0 fw-bold">{service}</h4>
      </div>
    </Card.Title>
    <div className="">
        
    <div c className={`badge rounded-pill ${
                      singleOrder.order_status === 2
                        ? "bg-success text-white"
                        : singleOrder.order_status === 1
                        ? "bg-warning text-dark"
                        : "bg-dark text-white"
                    }`}
                  >
                    {singleOrder.order_status === 2
                      ? "Completed"
                      : singleOrder.order_status === 1
                      ? "In Progress"
                      : "Received"}</div>
    </div>
  </div>
  <Card.Text className="text-muted mt-2">
   service description
    <br />
    
    
  </Card.Text>
</Card.Body>
</Card>
    );
}
export default OrderServiceCard;