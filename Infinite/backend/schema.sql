-- TMS Database Schema
-- Run this in your PostgreSQL 'infinite' database

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS ticket_updates;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS ticket_status;

CREATE TYPE user_role AS ENUM ('ADMIN', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'DM', 'USER');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'USER',
    department VARCHAR(100), -- e.g., 'DEVELOPMENT', 'DESIGN', 'DELIVERY'
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status ticket_status DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_updates (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    screenshot_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Admin
-- password is 'admin123'
INSERT INTO users (name, email, password, role) 
VALUES ('Super Admin', 'admin@infinite.com', '$2b$10$6p2MhL6Gkq6Wd8hYy6/X9O1qY.rBPyv4yqB1yqB1yqB1yqB1yqB1.', 'ADMIN');
