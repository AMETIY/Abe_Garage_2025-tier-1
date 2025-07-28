import React from 'react';
// Import the AdminMenu component 
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import UpdateCustomer from '../../components/Admin/UpdateCustomer/UpdateCustomer';
import { useParams } from 'react-router';

const EditCustomer = () => {
  const { id } = useParams();
  return (
    <div>
    <div className="container-fluid admin-pages">
      <div className="row">
        <div className="col-md-3 admin-left-side">
          <AdminMenu />
        </div>
        <div className="col-md-9 admin-right-side">
          <UpdateCustomer id={id} />
        </div>
      </div>
    </div>
  </div>
  )
}

export default EditCustomer