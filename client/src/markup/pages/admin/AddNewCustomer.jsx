import React from 'react';
// Import the AdminMenu component 
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
// Import the AddNewCustomer component 
import AddNewCustomer from '../../components/Admin/AddNewCustomer/AddNewCustomer';

function AddNewCustomerPage(props) {
  return (
    <div>
      <div className="container-fluid admin-pages">
        <div className="row">
          <div className="col-md-3 admin-left-side">
            <AdminMenu />
          </div>
          <div className="col-md-9 admin-right-side">
            <AddNewCustomer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewCustomerPage;