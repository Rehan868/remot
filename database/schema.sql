-- Hotel Management System Database Schema
-- This script creates all tables, indexes, constraints, and initial seed data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS room_cleaning_status;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS owner_tax_documents;
DROP TABLE IF EXISTS owner_tax_info;
DROP TABLE IF EXISTS owner_accounting_info;
DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_settings;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE
);

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Create owners table
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode VARCHAR(20),
    country VARCHAR(100),
    notes TEXT,
    birthdate DATE,
    citizenship VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owner_accounting_info table
CREATE TABLE owner_accounting_info (
    owner_id UUID PRIMARY KEY REFERENCES owners(id) ON DELETE CASCADE,
    paymentMethod VARCHAR(50),
    accountNumber VARCHAR(100),
    bankName VARCHAR(100),
    iban VARCHAR(100),
    swift VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owner_tax_info table
CREATE TABLE owner_tax_info (
    owner_id UUID PRIMARY KEY REFERENCES owners(id) ON DELETE CASCADE,
    taxId VARCHAR(100),
    taxResidence VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owner_tax_documents table
CREATE TABLE owner_tax_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES owners(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    rooms INTEGER NOT NULL DEFAULT 0,
    owner_id UUID REFERENCES owners(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50),
    name VARCHAR(255),
    property VARCHAR(255),
    property_id UUID REFERENCES properties(id),
    type VARCHAR(50),
    capacity INTEGER DEFAULT 2,
    rate DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'available',
    description TEXT,
    amenities TEXT[],
    owner_id UUID REFERENCES owners(id),
    images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    property VARCHAR(255) NOT NULL,
    room_id UUID REFERENCES rooms(id),
    room_number VARCHAR(50) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    base_rate DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    remaining_amount DECIMAL(10, 2) DEFAULT 0,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    commission DECIMAL(10, 2) DEFAULT 0,
    tourism_fee DECIMAL(10, 2) DEFAULT 0,
    vat DECIMAL(10, 2) DEFAULT 0,
    net_to_owner DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    guest_document TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT status_check CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
    CONSTRAINT payment_status_check CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded'))
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    property VARCHAR(255) NOT NULL,
    vendor VARCHAR(255),
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_cleaning_status table
CREATE TABLE room_cleaning_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    property VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Dirty',
    last_cleaned TIMESTAMP WITH TIME ZONE,
    next_check_in TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT status_check CHECK (status IN ('Clean', 'Dirty', 'In Progress'))
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    type VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'string',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT type_check CHECK (type IN ('string', 'number', 'boolean', 'json')),
    CONSTRAINT category_check CHECK (category IN ('general', 'notifications', 'security', 'appearance', 'integrations'))
);

-- Create indexes for performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_owners_email ON owners(email);

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES 
(uuid_generate_v4(), 'Administrator', 'Full access to all system features'),
(uuid_generate_v4(), 'Manager', 'Can manage properties, bookings, and view reports'),
(uuid_generate_v4(), 'Front Desk', 'Can manage bookings and check-ins/outs'),
(uuid_generate_v4(), 'Cleaning Staff', 'Can update room cleaning status'),
(uuid_generate_v4(), 'Owner', 'Property owner with access to their properties');

-- Insert default permissions
INSERT INTO permissions (id, name, description, category) VALUES
(uuid_generate_v4(), 'manage_users', 'Create, update, and delete users', 'users'),
(uuid_generate_v4(), 'view_users', 'View user information', 'users'),
(uuid_generate_v4(), 'manage_roles', 'Create, update, and delete roles', 'users'),
(uuid_generate_v4(), 'manage_bookings', 'Create, update, and delete bookings', 'bookings'),
(uuid_generate_v4(), 'view_bookings', 'View booking information', 'bookings'),
(uuid_generate_v4(), 'manage_rooms', 'Create, update, and delete rooms', 'rooms'),
(uuid_generate_v4(), 'view_rooms', 'View room information', 'rooms'),
(uuid_generate_v4(), 'manage_properties', 'Create, update, and delete properties', 'properties'),
(uuid_generate_v4(), 'view_properties', 'View property information', 'properties'),
(uuid_generate_v4(), 'manage_expenses', 'Create, update, and delete expenses', 'finances'),
(uuid_generate_v4(), 'view_expenses', 'View expense information', 'finances'),
(uuid_generate_v4(), 'view_reports', 'View financial and occupancy reports', 'reports'),
(uuid_generate_v4(), 'manage_settings', 'Update system settings', 'settings'),
(uuid_generate_v4(), 'view_settings', 'View system settings', 'settings'),
(uuid_generate_v4(), 'update_cleaning_status', 'Update room cleaning status', 'cleaning'),
(uuid_generate_v4(), 'view_cleaning_status', 'View room cleaning status', 'cleaning'),
(uuid_generate_v4(), 'manage_owners', 'Create, update, and delete owners', 'owners'),
(uuid_generate_v4(), 'view_owners', 'View owner information', 'owners'),
(uuid_generate_v4(), 'view_audit_logs', 'View system audit logs', 'security'),
(uuid_generate_v4(), 'manage_staff', 'Manage staff members', 'users');

-- Insert default system settings
INSERT INTO system_settings (key, value, type, category, description) VALUES
('company_name', 'Hotel Manager', 'string', 'general', 'Company name'),
('company_email', 'info@hotelmanager.com', 'string', 'general', 'Company email address'),
('date_format', 'MM/DD/YYYY', 'string', 'general', 'Date format for display'),
('currency_format', 'USD', 'string', 'general', 'Currency format for display'),
('tax_rate', '5', 'number', 'general', 'Tax rate percentage'),
('enable_email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'),
('enable_sms_notifications', 'false', 'boolean', 'notifications', 'Enable SMS notifications'),
('session_timeout', '60', 'number', 'security', 'Session timeout in minutes'),
('enable_two_factor_auth', 'false', 'boolean', 'security', 'Enable two-factor authentication'),
('theme', 'light', 'string', 'appearance', 'UI theme (light/dark)'),
('logo_url', '/abstract-geometric-logo.png', 'string', 'appearance', 'Company logo URL'),
('enable_audit_logging', 'true', 'boolean', 'security', 'Enable audit logging'),
('default_check_in_time', '15:00', 'string', 'general', 'Default check-in time'),
('default_check_out_time', '11:00', 'string', 'general', 'Default check-out time'),
('booking_confirmation_template', '{"subject":"Booking Confirmation","body":"Dear {{guest_name}},\n\nYour booking has been confirmed.\n\nBooking details:\nBooking number: {{booking_number}}\nCheck-in: {{check_in}}\nCheck-out: {{check_out}}\n\nThank you for choosing us!\n\nBest regards,\nHotel Manager"}', 'json', 'notifications', 'Booking confirmation email template');

-- Insert admin user
INSERT INTO users (id, name, email, role, created_at, updated_at) VALUES 
(uuid_generate_v4(), 'Admin User', 'admin@example.com', 'Administrator', NOW(), NOW());

-- Create functions and triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owner_accounting_info_updated_at BEFORE UPDATE ON owner_accounting_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owner_tax_info_updated_at BEFORE UPDATE ON owner_tax_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_cleaning_status_updated_at BEFORE UPDATE ON room_cleaning_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log changes to bookings
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details, type)
    VALUES (NULL, 'System', 
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'CREATE'
                WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
                WHEN TG_OP = 'DELETE' THEN 'DELETE'
            END,
            'booking', 
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE
                WHEN TG_OP = 'INSERT' THEN json_build_object('booking_number', NEW.booking_number, 'guest_name', NEW.guest_name)
                WHEN TG_OP = 'UPDATE' THEN json_build_object('booking_number', NEW.booking_number, 'guest_name', NEW.guest_name, 'status', NEW.status)
                WHEN TG_OP = 'DELETE' THEN json_build_object('booking_number', OLD.booking_number, 'guest_name', OLD.guest_name)
            END,
            'booking');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking changes
CREATE TRIGGER log_booking_changes AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_booking_changes();

-- Function to log changes to rooms
CREATE OR REPLACE FUNCTION log_room_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details, type)
    VALUES (NULL, 'System', 
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'CREATE'
                WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
                WHEN TG_OP = 'DELETE' THEN 'DELETE'
            END,
            'room', 
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE
                WHEN TG_OP = 'INSERT' THEN json_build_object('number', NEW.number, 'name', NEW.name)
                WHEN TG_OP = 'UPDATE' THEN json_build_object('number', NEW.number, 'name', NEW.name, 'status', NEW.status)
                WHEN TG_OP = 'DELETE' THEN json_build_object('number', OLD.number, 'name', OLD.name)
            END,
            'system');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room changes
CREATE TRIGGER log_room_changes AFTER INSERT OR UPDATE OR DELETE ON rooms
FOR EACH ROW EXECUTE FUNCTION log_room_changes();

-- Function to log user logins
CREATE OR REPLACE FUNCTION log_user_login(user_id UUID, user_name TEXT, ip_address TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_name, action, resource, resource_id, details, ip_address, type)
    VALUES (user_id, user_name, 'LOGIN', 'user', user_id, json_build_object('message', 'User logged in successfully'), ip_address, 'authentication');
END;
$$ LANGUAGE plpgsql;

-- Function to update room status when booking status changes
CREATE OR REPLACE FUNCTION update_room_status_on_booking_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If booking status changed to checked-in, update room status to occupied
    IF (TG_OP = 'UPDATE' AND NEW.status = 'checked-in' AND OLD.status != 'checked-in') THEN
        UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
    -- If booking status changed to checked-out, update room status to cleaning
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'checked-out' AND OLD.status != 'checked-out') THEN
        UPDATE rooms SET status = 'cleaning' WHERE id = NEW.room_id;
        -- Also update cleaning status
        INSERT INTO room_cleaning_status (room_id, room_number, property, status)
        VALUES (NEW.room_id, NEW.room_number, NEW.property, 'Dirty')
        ON CONFLICT (room_id) DO UPDATE SET status = 'Dirty', updated_at = NOW();
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating room status on booking changes
CREATE TRIGGER update_room_status_on_booking_change AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_room_status_on_booking_change();

-- Function to update room status when cleaning status changes
CREATE OR REPLACE FUNCTION update_room_status_on_cleaning_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If cleaning status changed to Clean, update room status to available
    IF (TG_OP = 'UPDATE' AND NEW.status = 'Clean' AND OLD.status != 'Clean') THEN
        UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
    -- If cleaning status changed to In Progress, update room status to cleaning
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'In Progress' AND OLD.status != 'In Progress') THEN
        UPDATE rooms SET status = 'cleaning' WHERE id = NEW.room_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating room status on cleaning changes
CREATE TRIGGER update_room_status_on_cleaning_change AFTER UPDATE ON room_cleaning_status
FOR EACH ROW EXECUTE FUNCTION update_room_status_on_cleaning_change();