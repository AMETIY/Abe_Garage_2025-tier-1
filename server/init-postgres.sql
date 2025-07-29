-- PostgreSQL Database Initialization for Abe Garage
-- This script creates all necessary tables for the application

-- Customers tables
CREATE TABLE IF NOT EXISTS customer_identifier (
    customer_id SERIAL PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL UNIQUE,
    customer_phone_number VARCHAR(255) NOT NULL,
    customer_added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_info (
    customer_info_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    customer_first_name VARCHAR(255) NOT NULL,
    customer_last_name VARCHAR(255) NOT NULL,
    active_customer_status INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id)
);

CREATE TABLE IF NOT EXISTS customer_vehicle_info (
    vehicle_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    vehicle_year INTEGER NOT NULL,
    vehicle_make VARCHAR(255) NOT NULL,
    vehicle_model VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(255) NOT NULL,
    vehicle_mileage INTEGER NOT NULL,
    vehicle_tag VARCHAR(255) NOT NULL,
    vehicle_serial VARCHAR(255) NOT NULL,
    vehicle_color VARCHAR(255) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id)
);

-- Company tables
CREATE TABLE IF NOT EXISTS company_roles (
    company_role_id SERIAL PRIMARY KEY,
    company_role_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS common_services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT
);

CREATE TABLE IF NOT EXISTS company_employees (
    employee_id SERIAL PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL UNIQUE,
    employee_first_name VARCHAR(255) NOT NULL,
    employee_last_name VARCHAR(255) NOT NULL,
    employee_phone VARCHAR(255) NOT NULL,
    employee_password_hashed VARCHAR(255) NOT NULL,
    employee_added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_role_id INTEGER NOT NULL,
    active_employee INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (company_role_id) REFERENCES company_roles (company_role_id)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_description TEXT,
    order_completed INTEGER DEFAULT 0,
    order_services TEXT,
    order_total_price DECIMAL(10, 2) DEFAULT 0.00,
    additional_request TEXT,
    notes_for_internal_use TEXT,
    additional_requests_completed INTEGER DEFAULT 0,
    order_status INTEGER DEFAULT 1,
    order_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES company_employees (employee_id),
    FOREIGN KEY (customer_id) REFERENCES customer_identifier (customer_id),
    FOREIGN KEY (vehicle_id) REFERENCES customer_vehicle_info (vehicle_id)
);

-- Insert default roles
INSERT INTO
    company_roles (company_role_name)
VALUES ('Employee'),
    ('Manager'),
    ('Admin') ON CONFLICT (company_role_name) DO NOTHING;

-- Insert default admin user (password: 123456)
INSERT INTO
    company_employees (
        employee_email,
        employee_first_name,
        employee_last_name,
        employee_phone,
        employee_password_hashed,
        company_role_id,
        active_employee
    )
VALUES (
        'admin@admin.com',
        'Admin',
        'User',
        '123-456-7890',
        '$2b$10$fHQJLWkKlGGJQJQJQJQJQOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
        3,
        1
    ) ON CONFLICT (employee_email) DO NOTHING;

-- Insert some default services
INSERT INTO
    common_services (
        service_name,
        service_description
    )
VALUES (
        'Oil Change',
        'Complete oil and filter change service'
    ),
    (
        'Brake Service',
        'Brake inspection and repair service'
    ),
    (
        'Tire Service',
        'Tire installation and balancing'
    ),
    (
        'Engine Diagnostic',
        'Computer diagnostic of engine systems'
    ),
    (
        'Transmission Service',
        'Transmission fluid change and inspection'
    ) ON CONFLICT DO NOTHING;