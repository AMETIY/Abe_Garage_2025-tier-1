-- Additional Demo Accounts for Portfolio Showcase
-- Run this after setup-admin.sql

-- Create Manager Demo Account
INSERT INTO employee (employee_email, active_employee, added_date)
VALUES ('manager@demo.com', 1, CURRENT_TIMESTAMP);

INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone)
VALUES (2, 'John', 'Manager', '555-111-2222');

-- Manager password: manager123 (hashed)
INSERT INTO employee_pass (employee_id, employee_password_hashed)
VALUES (2, '$2b$10$IqAXnqL1ES7Nm/ZWYxk5cuKvVLjhIq0rbaIIPgggHYGRa7qgjg/zK');

-- Assign Manager role
INSERT INTO employee_role (employee_id, company_role_id)
VALUES (2, 2);

-- Create Employee Demo Account  
INSERT INTO employee (employee_email, active_employee, added_date)
VALUES ('employee@demo.com', 1, CURRENT_TIMESTAMP);

INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone)
VALUES (3, 'Jane', 'Worker', '555-333-4444');

-- Employee password: employee123 (hashed)
INSERT INTO employee_pass (employee_id, employee_password_hashed)
VALUES (3, '$2b$10$8L7QZbXKMtju/zFvxYNxtuIJvrBET3x9MxuZD0HD0uGjAMptR6toS');

-- Assign Employee role
INSERT INTO employee_role (employee_id, company_role_id)
VALUES (3, 1);

-- Add some sample customers for demo
INSERT INTO customer (customer_email, customer_phone_number, active_customer, added_date)
VALUES 
('john.doe@email.com', '555-123-4567', 1, CURRENT_TIMESTAMP),
('jane.smith@email.com', '555-987-6543', 1, CURRENT_TIMESTAMP);

INSERT INTO customer_info (customer_id, customer_first_name, customer_last_name)
VALUES 
(1, 'John', 'Doe'),
(2, 'Jane', 'Smith');

-- Add sample vehicles
INSERT INTO customer_vehicle (vehicle_id, customer_id, vehicle_year, vehicle_make, vehicle_model, vehicle_type, vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color, added_date)
VALUES 
(1, 1, 2020, 'Toyota', 'Camry', 'Sedan', 45000, 'ABC-123', 'VIN123456789', 'Blue', CURRENT_TIMESTAMP),
(2, 2, 2019, 'Honda', 'Civic', 'Sedan', 32000, 'XYZ-789', 'VIN987654321', 'Red', CURRENT_TIMESTAMP);

-- Add sample services
INSERT INTO common_services (service_name, service_description)
VALUES 
('Oil Change', 'Standard oil change service'),
('Brake Inspection', 'Complete brake system inspection'),
('Tire Rotation', 'Rotate tires for even wear');

-- Verify all demo accounts
SELECT 
    e.employee_id,
    e.employee_email,
    ei.employee_first_name,
    ei.employee_last_name,
    cr.company_role_name
FROM employee e
JOIN employee_info ei ON e.employee_id = ei.employee_id
JOIN employee_role er ON e.employee_id = er.employee_id
JOIN company_roles cr ON er.company_role_id = cr.company_role_id
WHERE e.employee_email IN ('admin@admin.com', 'manager@demo.com', 'employee@demo.com')
ORDER BY cr.company_role_id DESC; 