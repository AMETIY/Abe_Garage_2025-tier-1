const api_url = import.meta.env.VITE_API_URL;

const createService = async (formData, loggedInEmployeeToken) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": loggedInEmployeeToken,
    },
    body: JSON.stringify(formData),
  };
  console.log(requestOptions);
  const response = await fetch(`${api_url}/api/service`, requestOptions);
  return response;
};

// A function to send get request to get all employees

// A function to send get request to get all services
const getAllServices = async (loggedInEmployeeToken) => {
  // console.log(token);
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": loggedInEmployeeToken,
    },
  };
  const response = await fetch(`${api_url}/api/services`, requestOptions);
  return response;
};

const deleteService = async (id, loggedInEmployeeToken) => {
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": loggedInEmployeeToken,
    },
  };
  const response = await fetch(`${api_url}/api/service/${id}`, requestOptions);
  return response;
};
const updateService = (
  service_id,
  service_name,
  service_description,
  loggedInEmployeeToken
) => {
  const requestOptions = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": loggedInEmployeeToken,
    },
    body: JSON.stringify({ service_id, service_name, service_description }),
  };
  return fetch(`${api_url}/api/service`, requestOptions);
};
const serviceServices = {
  getAllServices,
  createService,
  deleteService,
  updateService,
};

export default serviceServices;
