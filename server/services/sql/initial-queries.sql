-- Customers tables  
CREATE TABLE IF NOT EXISTS customer_identifier (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email TEXT NOT NULL UNIQUE,
  customer_phone_number TEXT NOT NULL,
  customer_added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_info (
  customer_info_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL, 
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  active_customer_status INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer_identifier(customer_id)
);

CREATE TABLE IF NOT EXISTS customer_vehicle_info (
  vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL, 
  vehicle_year INTEGER NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_mileage INTEGER NOT NULL, 
  vehicle_tag TEXT NOT NULL,
  vehicle_serial TEXT NOT NULL,
  vehicle_color TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer_identifier(customer_id)
);

-- Company tables 
CREATE TABLE IF NOT EXISTS company_roles (
  company_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_role_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS common_services (
  service_id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL,
  service_description TEXT
);

-- Employee tables 
CREATE TABLE IF NOT EXISTS employee (
  employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_email TEXT NOT NULL UNIQUE,
  active_employee INTEGER NOT NULL,
  added_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_info (
  employee_info_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  employee_first_name TEXT NOT NULL,
  employee_last_name TEXT NOT NULL,
  employee_phone TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

CREATE TABLE IF NOT EXISTS employee_pass (
  employee_pass_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  employee_password_hashed TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

CREATE TABLE IF NOT EXISTS employee_role (
  employee_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_role_id INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
  FOREIGN KEY (company_role_id) REFERENCES company_roles(company_role_id)
);

-- Order tables  
CREATE TABLE IF NOT EXISTS orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  active_order INTEGER NOT NULL,
  order_hash TEXT NOT NULL,
  order_description TEXT,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id), 
  FOREIGN KEY (customer_id) REFERENCES customer_identifier(customer_id),
  FOREIGN KEY (vehicle_id) REFERENCES customer_vehicle_info(vehicle_id)
);

CREATE TABLE IF NOT EXISTS order_info (
  order_info_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  order_total_price INTEGER NOT NULL,
  estimated_completion_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  additional_request TEXT,
  notes_for_internal_use TEXT,
  notes_for_customer TEXT,
  additional_requests_completed INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE IF NOT EXISTS order_services (
  order_service_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  service_completed INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (service_id) REFERENCES common_services(service_id)
);

CREATE TABLE IF NOT EXISTS order_status (
  order_status_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  order_status INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Add the roles to the database 
INSERT OR IGNORE INTO company_roles (company_role_name)
VALUES ('Employee'), ('Manager'), ('Admin');

-- Admin account will be created by setup-admin.js script 