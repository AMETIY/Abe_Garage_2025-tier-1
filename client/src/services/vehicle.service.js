///api/vehicle/customer/:customer_id


// Import from the env 
const api_url = import.meta.env.VITE_API_URL;

// A function to send post request to create a new employee 
const createVehicle = async (formData, loggedInEmployeeToken) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': loggedInEmployeeToken
    },
    body: JSON.stringify(formData)
  };
  console.log(requestOptions);
  const response = await fetch(`${api_url}/api/vehicle`, requestOptions);
  return response;
}

// A function to send get request to get all employees
const getVehiclesByCustomer = async (loggedInEmployeeToken,id) => {
  // console.log(token);
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': loggedInEmployeeToken
    }
  };
  const response = await fetch(`${api_url}/api/vehicle/customer/${id}`, requestOptions);
  return response;
}

const getVehicle = async (loggedInEmployeeToken,id) => {
  // console.log(token);
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': loggedInEmployeeToken
    }
  };
  const response = await fetch(`${api_url}/api/vehicle/${id}`, requestOptions);
  return response;
}


// Export all the functions 
const vehicleService = {
    getVehiclesByCustomer,
    createVehicle,
    getVehicle
}
export default vehicleService; 