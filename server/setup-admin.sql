-- Setup Admin Account for Abie Garage
-- Run this script in your MySQL database

-- First, make sure the roles exist
INSERT IGNORE INTO company_roles (company_role_name)
VALUES ('Employee'), ('Manager'), ('Admin');

-- Create the admin employee account
INSERT INTO employee (employee_email, active_employee, added_date)
VALUES ('admin@admin.com', 1, CURRENT_TIMESTAMP);

-- Create employee info
INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone)
VALUES (1, 'Admin', 'Admin', '555-555-5555'); 

-- Create employee password (using the hash generated from generate-hash.js)
INSERT INTO employee_pass (employee_id, employee_password_hashed)
VALUES (1, '$2b$10$v/fRJy3UJGAsM/eTdyYZh.G8xGAPu1JZyAyBTw9OoFS0bZ8r3Afjy');  

-- Assign admin role
INSERT INTO employee_role (employee_id, company_role_id)
VALUES (1, 3);

-- Verify the admin account was created
SELECT 
    e.employee_id,
    e.employee_email,
    e.active_employee,
    ei.employee_first_name,
    ei.employee_last_name,
    cr.company_role_name
FROM employee e
JOIN employee_info ei ON e.employee_id = ei.employee_id
JOIN employee_role er ON e.employee_id = er.employee_id
JOIN company_roles cr ON er.company_role_id = cr.company_role_id
WHERE e.employee_email = 'admin@admin.com'; 