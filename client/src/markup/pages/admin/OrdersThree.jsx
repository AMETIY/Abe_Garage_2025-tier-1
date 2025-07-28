import React from "react";
import AdminMenu from "../../components/Admin/AdminMenu/AdminMenu";
import NewOrdersTwo from "../../components/Admin/Orders/newOrdersTwo";
import { useParams } from "react-router";
import NewOrdersThree from "../../components/Admin/Orders/NewOrderThree";

const OrdersThree = () => {
    const {c_id,v_id} =  useParams()
    console.log(c_id,v_id)
  return (
<div>
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <NewOrdersThree customer_id = {c_id} vehicle_id = {v_id}/> 
        </div>
      </div>
    </div>
  </div>
  );
}

export default OrdersThree; 