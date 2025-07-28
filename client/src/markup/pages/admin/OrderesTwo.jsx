import React from "react";
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
import NewOrdersTwo from "../../components/Admin/Orders/newOrdersTwo";
import { useParams } from "react-router";

const OrdersTwo = () => {
    const {id} =  useParams()
  return (
<div>
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <NewOrdersTwo id = {id}/> 
        </div>
      </div>
    </div>
  </div>
  );
}

export default OrdersTwo; 