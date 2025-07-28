import React from 'react';
// Import the AddEmployeeForm component 
import AddEmployeeForm from '../../components/Admin/AddEmployeeForm/AddEmployeeForm';
// Import the AdminMenu component 
import AdminMenu from '../../components/Admin/AdminMenu/AdminMenu';
import AddVehicle from '../../components/Admin/AddVehicle/AddVehicle';
import { useParams } from 'react-router';

function AddVehiclePage(props) {
  useParams();
  const { id } = useParams();
  return (
    <div>
      <div className="container-fluid admin-pages">
        <div className="row">
          <div className="col-md-3 admin-left-side">
            <AdminMenu />
          </div>
          <div className="col-md-9 admin-right-side">
            <AddVehicle id = {id}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVehiclePage;