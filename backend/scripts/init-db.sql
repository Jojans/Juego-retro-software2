-- Initialize Space Arcade Game Database
-- This script is run when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables are created by the Node.js application
-- This file is kept for any additional database setup that might be needed

-- Add any custom functions or triggers here if needed
