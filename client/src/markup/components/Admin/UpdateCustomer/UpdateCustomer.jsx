import React, { use, useEffect, useState } from 'react';
// import customer.service.js 
// Import the useAuth hook 
import { useAuth } from "../../../../Contexts/AuthContext";
import customerService from '../../../../services/customer.service';
import { useNavigate } from 'react-router';

function UpdateCustomer({id}) {
  const [customer_first_name, setFirstName] = useState('');
  const [customer_last_name, setLastName] = useState('');
  const [customer_phone_number, setPhoneNumber] = useState('');
  const [customer_email, setEmail] = useState('');
  const [active_customer_status, setActiveCustomerStatus] = useState(1);

  // Errors 
  const [firstNameRequired, setFirstNameRequired] = useState('');

  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const navigator = useNavigate();

  // Create a variable to hold the user's token
  let loggedInEmployeeToken = '';
  // Destructure the auth hook and get the token 
  const { employee } = useAuth();
  if (employee && employee.employee_token) {
    loggedInEmployeeToken = employee.employee_token;
  }
  // Get the customer id from the URL
  useEffect(() => {
    const customer = customerService.getSingleCustomer(id, loggedInEmployeeToken).then((response) => response.json()).then((data) => {
      // If Error is returned from the API server, set the error message
      if (data.error) {
        setServerError(data.error)
      } else {
        console.log("customer -> ", data);
        // Handle successful response
        setEmail(data.customer_email);
      }
    }).catch((err) => {
      console.log(err);
    }
    );
  }, []);


  const handleSubmit = (e) => {
    // Prevent the default behavior of the form
    e.preventDefault();
    // Handle client side validations  
    let valid = true; // Flag 
    // First name is required 
    if (!customer_first_name) {
      setFirstNameRequired('First name is required');
      valid = false;
    } else {
      setFirstNameRequired('');
    }

    // If the form is not valid, do not submit 
    if (!valid) {
      return;
    }
    const formData = {
      customer_first_name,
      customer_last_name,
      customer_phone_number,
      active_customer_status
  
    };
    // Pass the form data to the service 
    const newcustomer = customerService.UpdateCustomer(formData, loggedInEmployeeToken,id);
    newcustomer.then((response) => response.json())
      .then((data) => {
        // console.log(data);
        // If Error is returned from the API server, set the error message
        if (data.error) {
          setServerError(data.error)
        } else {
          // Handle successful response 
          setSuccess(true);
          setServerError('')
          // Redirect to the customers page after 2 seconds 
          // For now, just redirect to the home page 
          setTimeout(() => {
            // window.location.href = '/admin/customers';
            navigator('/admin/customers');
          }, 2000);
        }
      })
      // Handle Catch 
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setServerError(resMessage);
      });
  }


  return (
    <section className="contact-section">
      <div className="auto-container">
        <div className="contact-title">
          <h2>Edit: Customer email </h2>
            <h4 style={{fontWeight: 'bold'}}>customer email: {customer_email}</h4>
        </div>
        <div>
        </div>
        <div className="row clearfix">
          <div className="form-column col-lg-7">
            <div className="inner-column">
              <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="row clearfix">
                    <div className="form-group col-md-12">

                      {serverError && <div className="validation-error" role="alert">{serverError}</div>}
                        {success && <div className="success-message" role="alert">C{serverError && <div className="validation-error" role="alert">{serverError}</div>}ustomer added successfully</div>}
                     
                    </div>
                    <div className="form-group col-md-12">
                      <input type="text" name="customer_first_name" value={customer_first_name} onChange={event => setFirstName(event.target.value)} placeholder="customer first name" />
                      {firstNameRequired && <div className="validation-error" role="alert">{firstNameRequired}</div>}
                    </div>

                    <div className="form-group col-md-12">
                      <input type="text" name="customer_last_name" value={customer_last_name} onChange={event => setLastName(event.target.value)} placeholder="customer last name" required />
                    </div>

                    <div className="form-group col-md-12">
                      <input type="text" name="customer_phone_number" value={customer_phone_number} onChange={event => setPhoneNumber(event.target.value)} placeholder="customer phone (555-555-5555)" required />
                    </div>

                    <div className="form-group col-md-12">
                {/* is active ustome check box */}
                <label className="checkbox ">
                  <input type="checkbox" name="active_customer_status" value={active_customer_status}  onChange={event => setActiveCustomerStatus(event.target.value)}/>
                    <span className='p-2'>Is Active Customer  </span>
                </label>
                {/* end of is active customer check box */}
                  </div>

                    <div className="form-group col-md-12">
                      <button className="theme-btn btn-style-one" type="submit" data-loading-text="Please wait..."><span>Update</span></button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default UpdateCustomer;